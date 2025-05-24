// server/models/memberBadgeModel.js
const db = require('../config/db');

// List all assignments
exports.list = async () => {
  const res = await db.query(`
    SELECT mb.id, mb.member_id, mb.badge_id, mb.awarded_at, b.label
    FROM member_badges mb
    JOIN badges b ON b.id = mb.badge_id
    ORDER BY mb.awarded_at DESC
  `);
  return res.rows;
};

// Assign a badge
exports.assign = async ({ member_id, badge_id }) => {
  const res = await db.query(
    `INSERT INTO member_badges(member_id,badge_id) VALUES($1,$2) RETURNING *`,
    [member_id, badge_id]
  );
  return res.rows[0];
};

// Unassign (delete) an assignment
exports.unassign = async (id) => {
  const res = await db.query(`DELETE FROM member_badges WHERE id=$1`, [id]);
  return res.rowCount;
};
