// src/models/memberModel.js

const db = require('../config/db');

const normalize = v => (v == null || v === '' || v === 'null' || v === 'undefined')
  ? null
  : (typeof v === 'string' ? v.trim() : v);

// ── Basic CRUD & Helpers ─────────────────────────────────────────────────────

exports.checkDuplicateField = async (field, value) => {
  const allowed = ['email', 'contact_primary'];
  if (!allowed.includes(field)) throw new Error('Invalid field');
  const result = await db.query(
    `SELECT id FROM members WHERE LOWER(${field}) = LOWER($1) LIMIT 1`,
    [normalize(value)]
  );
  return result.rows.length > 0;
};

exports.createMember = async data => {
  const cols = [
    'user_id', 'profile_photo', 'title', 'first_name', 'surname', 'date_of_birth',
    'contact_primary', 'contact_secondary', 'email', 'nationality', 'gender',
    'marital_status', 'num_children', 'physical_address', 'profession', 'occupation',
    'work_address', 'date_joined_church', 'date_born_again',
    'date_baptized_immersion', 'baptized_in_christ_embassy',
    'date_received_holy_ghost', 'foundation_school_grad_date'
  ];
  const vals = cols.map(c => normalize(data[c]));
  vals[cols.indexOf('baptized_in_christ_embassy')] =
    data.baptized_in_christ_embassy === true || data.baptized_in_christ_embassy === 'true';

  const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
  const sql = `INSERT INTO members (${cols.join(',')})
               VALUES (${placeholders})
               RETURNING *;`;
  const result = await db.query(sql, vals);
  return result.rows[0];
};

exports.getAllMembers = async () => {
  const res = await db.query('SELECT * FROM members ORDER BY id DESC');
  return res.rows;
};

exports.getById = async id => {
  const res = await db.query('SELECT * FROM members WHERE id=$1', [id]);
  return res.rows[0] || null;
};


exports.getByMember
Id = async id => {
  const res = await db.query('SELECT * FROM members WHERE id=$1', [id]);
  return res.rows[0] || null;
};

exports.updateMember = async (id, data) => {
  const cols = Object.keys(data);
  if (!cols.length) return null;
  const vals = cols.map(c => normalize(data[c]));
  const setClause = cols.map((c, i) => `${c}=$${i + 1}`).join(', ');
  const sql = `
    UPDATE members
    SET ${setClause}, updated_at=NOW()
    WHERE id=$${cols.length + 1}
    RETURNING *;`;
  const res = await db.query(sql, [...vals, id]);
  return res.rows[0] || null;
};

exports.deleteMember = async id => {
  const rel = await db.query(
    'SELECT 1 FROM milestone_records WHERE member_id=$1 LIMIT 1',
    [id]
  );
  if (rel.rows.length) throw new Error('Cannot delete: milestone records exist');
  const res = await db.query(
    'DELETE FROM members WHERE id=$1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};

exports.getMembersByType = async type => {
  const res = await db.query(
    `SELECT * FROM members WHERE member_type=$1 ORDER BY id DESC`,
    [type]
  );
  return res.rows;
};

// ── CSV Upsert Helper ────────────────────────────────────────────────────────

exports.createOrUpdateMemberFromCsv = async data => {
  const {
    first_name, surname, email,
    contact_primary, date_of_birth, date_joined_church
  } = data;

  const norm = val => val ? normalize(val) : null;
  const vals = [norm(first_name), norm(surname), norm(email), norm(contact_primary), norm(date_of_birth), norm(date_joined_church)];

  const exist = await db.query(
    'SELECT id FROM members WHERE email=$1 LIMIT 1',
    [vals[2]]
  );
  if (exist.rows.length) {
    await db.query(
      `UPDATE members
         SET first_name=$1,
             surname=$2,
             contact_primary=$4,
             date_of_birth=$5,
             date_joined_church=$6
       WHERE email=$3`,
      vals
    );
  } else {
    await db.query(
      `INSERT INTO members
         (first_name,surname,email,contact_primary,date_of_birth,date_joined_church)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      vals
    );
  }
};

// ── Bulk Insert for Import ───────────────────────────────────────────────────

exports.bulkInsert = async rows => {
  if (!rows.length) return [];

  const keys = Object.keys(rows[0]);
  const values = rows.flatMap(row => keys.map(k => normalize(row[k])));
  const placeholders = rows
    .map((_, rowIndex) => `(${keys.map((_, colIndex) => `$${rowIndex * keys.length + colIndex + 1}`).join(',')})`)
    .join(', ');

  const query = `
    INSERT INTO members (${keys.join(', ')})
    VALUES ${placeholders}
    RETURNING id
  `;

  const result = await db.query(query, values);
  return result.rows;
};

// ── Finance & Gamification Methods ──────────────────────────────────────────

exports.stats = async memberId => {
  const st = await db.query(`
    SELECT
      COALESCE(SUM(amount),0)::FLOAT AS total,
      COUNT(*) AS count,
      COALESCE(AVG(amount),0)::FLOAT AS avg
    FROM income_transactions
    WHERE member_id=$1
  `, [memberId]);

  const { total, count, avg } = st.rows[0];

  const pr = await db.query(`
    SELECT
      SUM(CASE WHEN fulfilled>=amount THEN 1 ELSE 0 END)::INT AS done,
      COUNT(*)::INT AS all_count
    FROM pledges WHERE member_id=$1
  `, [memberId]);

  const { done, all_count } = pr.rows[0];
  const pledgePct = all_count ? Math.round((done / all_count) * 100) : 0;

  return { totalGiven: total, giftCount: count, avgGift: avg, pledgePct };
};

exports.heatmap = async memberId => {
  const res = await db.query(`
    SELECT
      transaction_date::TEXT AS date,
      SUM(amount)::INT AS count
    FROM income_transactions
    WHERE member_id=$1
    GROUP BY transaction_date
    ORDER BY transaction_date
  `, [memberId]);
  return res.rows;
};

exports.monthlyGiving = async memberId => {
  const res = await db.query(`
    SELECT
      to_char(transaction_date,'Mon') AS month,
      SUM(amount)::FLOAT AS amount
    FROM income_transactions
    WHERE member_id=$1
    GROUP BY date_part('month',transaction_date), month
    ORDER BY date_part('month',transaction_date)
  `, [memberId]);
  return res.rows;
};

exports.badges = async memberId => {
  const res = await db.query(`
    SELECT b.label, b.icon_name
    FROM member_badges mb
    JOIN badges b ON mb.badge_id=b.id
    WHERE mb.member_id=$1
    ORDER BY mb.awarded_at DESC
  `, [memberId]);
  return res.rows;
};

// ── Import Metadata (for ImportColumnController) ─────────────────────────────

exports.getAllByTable = async tableName => {
  const { rows } = await db.query(
    `SELECT column_name, label, required
     FROM import_columns
     WHERE table_name = $1
     ORDER BY id`,
    [tableName]
  );
  return rows;
};



exports.getMemberContact = async (memberId) => {
  const { rows } = await db.query(
    `SELECT email, contact_primary AS phone FROM members WHERE id = $1`,
    [memberId]
  );
  return rows[0] || null;
};
