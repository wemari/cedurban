const db = require('../config/db');

// List prayer requests for one member
exports.getMemberPrayerRequests = async (memberId) => {
  return await db.query(
    `SELECT * FROM prayer_requests WHERE member_id = $1 ORDER BY created_at DESC`,
    [memberId]
  );
};

// Create
exports.createPrayerRequest = async (memberId, request, status = 'Pending') => {
  return await db.query(
    `INSERT INTO prayer_requests (member_id, request, status, created_at, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [memberId, request, status]
  );
};

// Update
exports.updatePrayerRequest = async (memberId, id, request, status) => {
  return await db.query(
    `UPDATE prayer_requests
     SET request = $1, status = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND member_id = $4
     RETURNING *`,
    [request, status, id, memberId]
  );
};

// Delete
exports.deletePrayerRequest = async (memberId, id) => {
  return await db.query(
    `DELETE FROM prayer_requests WHERE id = $1 AND member_id = $2`,
    [id, memberId]
  );
};
