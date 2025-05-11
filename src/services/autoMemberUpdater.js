const db = require('../config/db');
const bcrypt = require('bcrypt');

// ✅ 1. Provision user accounts for members who don't have one
const provisionMissingUsers = async () => {
  try {
    const { rows: missingMembers } = await db.query(`
      SELECT id, email FROM members
      WHERE user_id IS NULL AND email IS NOT NULL
    `);

    let createdUsers = 0;

    for (const member of missingMembers) {
      const { id: memberId, email } = member;

      const { rows: existingUser } = await db.query(`
        SELECT id FROM users WHERE email = $1
      `, [email]);

      let userId;

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        const tempPassword = Math.random().toString(36).slice(-8);  // Temporary password logic
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const result = await db.query(`
          INSERT INTO users (email, password_hash, temp_password, password_reset_required)
          VALUES ($1, $2, $3, TRUE)
          RETURNING id
        `, [email, hashedPassword, tempPassword]);

        userId = result.rows[0].id;
        createdUsers++;
        // Avoid logging temp password in production
        console.log(`[✔] Created user for ${email} with temp password`);
      }

      await db.query(`
        UPDATE members SET user_id = $1 WHERE id = $2
      `, [userId, memberId]);
    }

    console.log(`[✔] Provisioned user accounts for ${missingMembers.length} members, ${createdUsers} new user(s) created`);
    return createdUsers;
  } catch (err) {
    console.error('[❌] Error in provisionMissingUsers:', err.message, err.stack);
    throw err;
  }
};

// ✅ 2. Sync user_id in members based on matching email from users table
const syncUserIds = async () => {
  try {
    const syncResult = await db.query(`
      UPDATE members
      SET user_id = u.id
      FROM users u
      WHERE members.email = u.email
        AND (members.user_id IS NULL OR members.user_id != u.id);
    `);
    console.log(`[✔] Synced user_id in members table — ${syncResult.rowCount} row(s) updated`);
    return syncResult.rowCount;
  } catch (err) {
    console.error('[❌] Error in syncUserIds:', err.message, err.stack);
    throw err;
  }
};

// ✅ 3. Manage First Timers and New Converts based on dates
const populateFromMembers = async () => {
  try {
    // Provision users for missing members and sync user_ids
    const createdUsers = await provisionMissingUsers();
    const syncedUsers = await syncUserIds();

    // ✅ Cleanup: Remove members from new_converts if they now qualify as first_timers
    await db.query(`
      DELETE FROM new_converts
      WHERE member_id IN (
        SELECT id FROM members
        WHERE date_joined_church >= NOW() - INTERVAL '21 days'
          AND date_born_again <= NOW() - INTERVAL '42 days'
      );
    `);

    // ✅ Cleanup: Remove members from first_timers if they now qualify as new_converts
    await db.query(`
      DELETE FROM first_timers
      WHERE member_id IN (
        SELECT id FROM members
        WHERE date_joined_church >= NOW() - INTERVAL '21 days'
          AND date_born_again > NOW() - INTERVAL '42 days'
      );
    `);

    // ✅ First Timers: joined <21 days ago, born again >42 days ago
    const { rowCount: ftInserted } = await db.query(`
      INSERT INTO first_timers (member_id, registration_date, how_heard)
      SELECT m.id, m.date_joined_church, 'auto-detected'
      FROM members m
      WHERE m.date_joined_church >= NOW() - INTERVAL '21 days'
        AND m.date_born_again <= NOW() - INTERVAL '42 days'
        AND m.id NOT IN (SELECT member_id FROM first_timers);
    `);
    console.log(`[✔] First Timers added: ${ftInserted}`);

    const { rowCount: ftUpdated } = await db.query(`
      UPDATE members
      SET member_type = 'first_timer', status = 'active'
      WHERE date_joined_church >= NOW() - INTERVAL '21 days'
        AND date_born_again <= NOW() - INTERVAL '42 days'
        AND member_type IS DISTINCT FROM 'first_timer';
    `);
    console.log(`[✔] First Timers updated in members table: ${ftUpdated}`);

    // ✅ New Converts: joined <21 days ago, born again ≤42 days ago
    const { rowCount: ncInserted } = await db.query(`
      INSERT INTO new_converts (member_id, conversion_date, conversion_type, baptism_scheduled)
      SELECT m.id, m.date_born_again, 'Salvation', false
      FROM members m
      WHERE m.date_joined_church >= NOW() - INTERVAL '21 days'
        AND m.date_born_again > NOW() - INTERVAL '42 days'
        AND m.id NOT IN (SELECT member_id FROM new_converts);
    `);
    console.log(`[✔] New Converts added: ${ncInserted}`);

    const { rowCount: ncUpdated } = await db.query(`
      UPDATE members
      SET member_type = 'new_convert', status = 'active'
      WHERE date_joined_church >= NOW() - INTERVAL '21 days'
        AND date_born_again > NOW() - INTERVAL '42 days'
        AND member_type IS DISTINCT FROM 'new_convert';
    `);
    console.log(`[✔] New Converts updated in members table: ${ncUpdated}`);

    return {
      createdUsers,
      syncedUsers,
      ftInserted,
      ftUpdated,
      ncInserted,
      ncUpdated
    };
  } catch (err) {
    console.error('[❌] Error in populateFromMembers:', err.message, err.stack);
    throw err;
  }
};

// ✅ 4. Promote First Timers after 21 days
const updateFirstTimers = async () => {
  try {
    const { rowCount: archived } = await db.query(`
      INSERT INTO first_timer_archive (member_id, registration_date, how_heard)
      SELECT member_id, registration_date, how_heard
      FROM first_timers
      WHERE registration_date <= NOW() - INTERVAL '21 days';
    `);

    const { rowCount: promoted } = await db.query(`
      UPDATE members
      SET member_type = 'member', status = 'active'
      WHERE id IN (
        SELECT member_id FROM first_timers
        WHERE registration_date <= NOW() - INTERVAL '21 days'
      )
      AND member_type = 'first_timer';
    `);

    const { rowCount: deleted } = await db.query(`
      DELETE FROM first_timers
      WHERE registration_date <= NOW() - INTERVAL '21 days';
    `);

    console.log(`[✔] First Timers promoted: ${promoted}, archived: ${archived}, deleted: ${deleted}`);
    return { promoted, archived, deleted };
  } catch (err) {
    console.error('[❌] Error in updateFirstTimers:', err.message, err.stack);
    throw err;
  }
};

// ✅ 5. Promote New Converts after 42 days using milestone logic
const updateNewConverts = async () => {
  try {
    console.log('[🔁] Updating New Converts using milestone_templates...');

    // Common Table Expression (CTE) to get the eligible members who are eligible for promotion
    const eligibleMembersCTE = `
      WITH required AS (
        SELECT name FROM milestone_templates WHERE required_for_promotion = TRUE
      ),
      completed AS (
        SELECT member_id, COUNT(DISTINCT milestone_name) AS milestones_done
        FROM milestone_records
        WHERE milestone_name IN (SELECT name FROM required)
        GROUP BY member_id
      ),
      eligible_members AS (
        SELECT c.member_id
        FROM completed c
        JOIN required r ON TRUE
        GROUP BY c.member_id, c.milestones_done
        HAVING COUNT(r.name) = c.milestones_done
      )
    `;

    // Update members who are eligible and have been in the "new_convert" category for 42 days
    const { rowCount: promoted } = await db.query(`
      ${eligibleMembersCTE}
      UPDATE members
      SET member_type = 'member', status = 'active'
      WHERE id IN (
        SELECT member_id FROM eligible_members
      )
      AND member_type = 'new_convert'
      AND id IN (
        SELECT member_id FROM new_converts
        WHERE conversion_date <= NOW() - INTERVAL '42 days'
      );
    `);

    // Inactivate members who are not eligible for promotion but have been in "new_convert" for 42 days
    const { rowCount: inactivated } = await db.query(`
      ${eligibleMembersCTE}
      UPDATE members
      SET member_type = 'member', status = 'inactive'
      WHERE id IN (
        SELECT member_id FROM new_converts
        WHERE conversion_date <= NOW() - INTERVAL '42 days'
        AND member_id NOT IN (SELECT member_id FROM eligible_members)
      )
      AND member_type = 'new_convert';
    `);

    // Archive the new converts who have been converted for more than 42 days
    const { rowCount: archived } = await db.query(`
      INSERT INTO new_convert_archive (
        member_id, conversion_date, conversion_type,
        baptism_scheduled, baptism_date, archived_at
      )
      SELECT member_id, conversion_date, conversion_type,
             baptism_scheduled, baptism_date, NOW()
      FROM new_converts
      WHERE conversion_date <= NOW() - INTERVAL '42 days';
    `);

    // Delete the new converts from the "new_converts" table who have been promoted
    const { rowCount: deletedNewConverts } = await db.query(`
      ${eligibleMembersCTE}
      DELETE FROM new_converts
      WHERE conversion_date <= NOW() - INTERVAL '42 days'
      AND member_id IN (
        SELECT member_id FROM eligible_members
      );
    `);

    console.log(`[✔] New Converts updated - Promoted: ${promoted}, Inactivated: ${inactivated}, Archived: ${archived}, Deleted: ${deletedNewConverts}`);
    return { promoted, inactivated, archived, deletedNewConverts };
  } catch (err) {
    console.error('[❌] Error in updateNewConverts:', err.message, err.stack);
    throw err;
  }
};

// Export the functions
module.exports = {
  populateFromMembers,
  updateFirstTimers,
  updateNewConverts
};
