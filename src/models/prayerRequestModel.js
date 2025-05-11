const db = require('../config/db');

exports.create = async (data) => {
  const { member_id, request, status } = data;
  const cleanedMemberId = parseInt(member_id);

  if (isNaN(cleanedMemberId)) {
    throw new Error('Invalid member ID');
  }

  const res = await db.query(
    `INSERT INTO prayer_requests (member_id, request, status)
    VALUES ($1, $2, $3)
    RETURNING *;`
  , [cleanedMemberId, request, status || 'pending']);

  return res.rows[0];
};


exports.getAll = async () => {
  const res = await db.query(`SELECT * FROM prayer_requests ORDER BY created_at DESC`);
  return res.rows;
};

exports.getById = async (id) => {
  const res = await db.query(`SELECT * FROM prayer_requests WHERE id = $1`, [id]);
  return res.rows[0];
};

exports.update = async (id, data) => {
  const { request, status } = data;
  const res = await db.query(
    `UPDATE prayer_requests
    SET request = $1, status = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *;`
  , [request, status, id]);
  return res.rows[0];
};

exports.delete = async (id) => {
  const res = await db.query(`DELETE FROM prayer_requests WHERE id = $1 RETURNING *;`, [id]);
  return res.rows[0];
}; 