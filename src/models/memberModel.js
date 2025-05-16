const db = require('../config/db');

const normalize = (val) => {
  if (val === '' || val === 'null' || val === 'undefined' || val == null) return null;
  return typeof val === 'string' ? val.trim() : val;
};

exports.checkDuplicateField = async (field, value) => {
  const allowed = ['email', 'contact_primary'];
  if (!allowed.includes(field)) throw new Error('Invalid field');
  const result = await db.query(
    `SELECT id FROM members WHERE LOWER(${field}) = LOWER($1) LIMIT 1`,
    [normalize(value)]
  );
  return result.rows.length > 0;
};

exports.createMember = async (data) => {
  const {
    user_id, profile_photo, title, first_name, surname, date_of_birth,
    contact_primary, contact_secondary, email, nationality, gender,
    marital_status, num_children, physical_address, profession, occupation,
    work_address, date_joined_church, date_born_again, date_baptized_immersion,
    baptized_in_christ_embassy, date_received_holy_ghost, foundation_school_grad_date
  } = data;

  const result = await db.query(
    `INSERT INTO members (
      user_id, profile_photo, title, first_name, surname, date_of_birth,
      contact_primary, contact_secondary, email, nationality, gender,
      marital_status, num_children, physical_address, profession, occupation,
      work_address, date_joined_church, date_born_again, date_baptized_immersion,
      baptized_in_christ_embassy, date_received_holy_ghost, foundation_school_grad_date
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16,
      $17, $18, $19, $20,
      $21, $22, $23
    )
    RETURNING *;`,
    [
      normalize(user_id), profile_photo, normalize(title), normalize(first_name), normalize(surname), normalize(date_of_birth),
      normalize(contact_primary), normalize(contact_secondary), normalize(email), normalize(nationality), normalize(gender),
      normalize(marital_status), normalize(num_children), normalize(physical_address), normalize(profession), normalize(occupation),
      normalize(work_address), normalize(date_joined_church), normalize(date_born_again), normalize(date_baptized_immersion),
      baptized_in_christ_embassy === 'true' || baptized_in_christ_embassy === true,
      normalize(date_received_holy_ghost), normalize(foundation_school_grad_date)
    ]
  );

  return result.rows[0];
};

exports.getAllMembers = async () => {
  const result = await db.query('SELECT * FROM members ORDER BY id DESC');
  return result.rows;
};

exports.getMemberById = async (id) => {
  const result = await db.query('SELECT * FROM members WHERE id = $1', [id]);
  return result.rows[0] || null;
};

exports.updateMember = async (id, data) => {
  const cols = Object.keys(data);
  const vals = Object.values(data);

  if (cols.length === 0) return null;

  const setClause = cols.map((col, i) => `${col} = $${i + 1}`).join(', ');

  const sql = `
    UPDATE members
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${cols.length + 1}
    RETURNING *;
  `;

  const result = await db.query(sql, [...vals.map(normalize), id]);
  return result.rows[0] || null;
};

exports.deleteMember = async (id) => {
  const relatedRecords = await db.query('SELECT * FROM milestone_records WHERE member_id = $1', [id]);
  if (relatedRecords.rows.length > 0) {
    throw new Error('Cannot delete member: Related milestone records exist.');
  }

  const result = await db.query('DELETE FROM members WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

exports.getMembersByType = async (type) => {
  const result = await db.query(
    `SELECT * FROM members WHERE member_type = $1 ORDER BY id DESC`,
    [type]
  );
  return result.rows;
};

/* ── NEW FINANCE & GAMIFICATION METHODS ─────────────────────────────────── */

  /* ── NEW FINANCE & GAMIFICATION METHODS ─────────────────────────────────── */

// 1. Summary stats: totalGiven, giftCount, avgGift, pledgePct
exports.stats = async (memberId) => {
  const statsRes = await db.query(`
    SELECT
      COALESCE(SUM(amount),0) AS total,
      COUNT(*)             AS count,
      COALESCE(AVG(amount),0) AS avg
    FROM income_transactions
    WHERE member_id = $1
  `, [memberId]);
  const { total, count, avg } = statsRes.rows[0];

  const pledgeRes = await db.query(`
    SELECT
      SUM(CASE WHEN fulfilled>=amount THEN 1 ELSE 0 END)::INT AS done,
      COUNT(*)::INT                                  AS all_count
    FROM pledges
    WHERE member_id = $1
  `, [memberId]);
  const { done, all_count } = pledgeRes.rows[0];
  const pledgePct = all_count ? Math.round((done / all_count) * 100) : 0;

  return {
    totalGiven: Number(total),
    giftCount:  Number(count),
    avgGift:    Number(avg),
    pledgePct
  };
};

// 2. Heatmap data: [{ date, count }]
exports.heatmap = async (memberId) => {
  const res = await db.query(`
    SELECT
      transaction_date::TEXT AS date,
      SUM(amount)::INT         AS count
    FROM income_transactions
    WHERE member_id = $1
    GROUP BY transaction_date
    ORDER BY transaction_date
  `, [memberId]);
  return res.rows;
};

// 3. Monthly giving totals: [{ month, amount }]
exports.monthlyGiving = async (memberId) => {
  const res = await db.query(`
    SELECT
      to_char(transaction_date,'Mon')     AS month,
      SUM(amount)::FLOAT                  AS amount
    FROM income_transactions
    WHERE member_id = $1
    GROUP BY month, date_part('month',transaction_date)
    ORDER BY date_part('month',transaction_date)
  `, [memberId]);
  return res.rows;
};

// 4. Earned badges: [{ label, icon_name }]
exports.badges = async (memberId) => {
  const res = await db.query(`
    SELECT b.label, b.icon_name
    FROM member_badges mb
    JOIN badges b ON mb.badge_id = b.id
    WHERE mb.member_id = $1
    ORDER BY mb.awarded_at DESC
  `, [memberId]);
  return res.rows;
};