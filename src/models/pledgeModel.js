// server/models/pledgeModel.js
const db = require('../config/db');
const normalize = v => (v == null || v === '') ? null : (typeof v === 'string' ? v.trim() : v);

// List all
exports.list = async () => {
  const res = await db.query(`SELECT * FROM pledges ORDER BY created_at DESC`);
  return res.rows;
};

// Get by ID
exports.get = async (id) => {
  const res = await db.query(`SELECT * FROM pledges WHERE id=$1`, [id]);
  return res.rows[0] || null;
};

// Create
exports.create = async ({ member_id, amount, description }) => {
  const res = await db.query(
    `INSERT INTO pledges(member_id, amount, description)
     VALUES($1,$2,$3) RETURNING *`,
    [member_id, normalize(amount), normalize(description)]
  );
  return res.rows[0];
};

// Update
exports.update = async (id, data) => {
  const cols = Object.keys(data);
  const vals = cols.map(c => normalize(data[c]));
  const set  = cols.map((c,i)=>`${c}=$${i+1}`).join(',');
  const res  = await db.query(
    `UPDATE pledges SET ${set}, updated_at=NOW() WHERE id=$${cols.length+1} RETURNING *`,
    [...vals, id]
  );
  return res.rows[0] || null;
};

// Delete
exports.delete = async (id) => {
  const res = await db.query(`DELETE FROM pledges WHERE id=$1 RETURNING id`, [id]);
  return res.rows[0] || null;
};
