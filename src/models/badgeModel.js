// server/models/badgeModel.js
const db = require('../config/db');
const normalize = v => (v == null || v === '') ? null : (typeof v === 'string' ? v.trim() : v);

// List all badges
exports.list = async () => {
  const res = await db.query(`SELECT * FROM badges ORDER BY id`);
  return res.rows;
};

// Get one
exports.get = async (id) => {
  const res = await db.query(`SELECT * FROM badges WHERE id=$1`, [id]);
  return res.rows[0] || null;
};

// Create
exports.create = async ({ label, icon_name, description }) => {
  const res = await db.query(
    `INSERT INTO badges(label, icon_name, description) VALUES($1,$2,$3) RETURNING *`,
    [normalize(label), normalize(icon_name), normalize(description)]
  );
  return res.rows[0];
};

// Update
exports.update = async (id, { label, icon_name, description }) => {
  const res = await db.query(
    `UPDATE badges
     SET label=$1, icon_name=$2, description=$3, updated_at=NOW()
     WHERE id=$4 RETURNING *`,
    [normalize(label), normalize(icon_name), normalize(description), id]
  );
  return res.rows[0] || null;
};

// Delete
exports.delete = async (id) => {
  const res = await db.query(
    `DELETE FROM badges WHERE id=$1 RETURNING id`,
    [id]
  );
  return res.rows[0] || null;
};
