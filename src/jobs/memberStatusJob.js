const db = require('../config/db');

async function updateMemberStatuses() {
  const now = new Date();

  // First Timers -> Full Members
  await db.query(`
    UPDATE members
    SET member_type = 'member'
    WHERE id IN (
      SELECT ft.member_id FROM first_timers ft
      WHERE ft.registration_date <= NOW() - INTERVAL '21 days'
    ) AND member_type = 'first_timer';
  `);

  // New Converts -> Full Members
  await db.query(`
    UPDATE members
    SET member_type = 'member'
    WHERE id IN (
      SELECT nc.member_id FROM new_converts nc
      WHERE nc.conversion_date <= NOW() - INTERVAL '42 days'
    ) AND member_type = 'new_convert';
  `);

  // Mark inactive (if no participation or events, you'd check milestones etc.)
  await db.query(`
    UPDATE members
    SET status = 'inactive'
    WHERE member_type IN ('first_timer', 'new_convert')
    AND updated_at <= NOW() - INTERVAL '60 days'
    AND status = 'active';
  `);

  console.log('Member statuses updated');
}

module.exports = updateMemberStatuses;
