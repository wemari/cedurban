const db = require('../config/db');

// ✅ Get all sessions, with member and counselor names
exports.getAllSessions = async () => {
  return await db.query(`
    SELECT 
      cs.*,
      m.id AS member_id,
      m.first_name || ' ' || m.surname AS member_name,
      c.first_name || ' ' || c.surname AS counselor_name
    FROM counseling_sessions cs
    LEFT JOIN members m ON cs.member_id = m.id
    LEFT JOIN members c ON cs.counselor_id = c.id
    ORDER BY cs.date DESC
  `);
};

// ✅ Get a session by ID
exports.getSessionById = async (id) => {
  return await db.query(`SELECT * FROM counseling_sessions WHERE id = $1`, [id]);
};

// ✅ Create a session (includes member_id now)
exports.createSession = async (session) => {
  const { date, time, counselor_id, member_id, mode, status, notes } = session;

  // Ensure that member_id and counselor_id are integers before inserting
  if (isNaN(member_id) || isNaN(counselor_id)) {
    throw new Error('Invalid member or counselor ID');
  }

  return await db.query(`
    INSERT INTO counseling_sessions (date, time, counselor_id, member_id, mode, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [date, time, counselor_id, member_id, mode, status, notes]);
};

// ✅ Update a session using proper fields
exports.updateSession = async (id, session) => {
  const { date, time, counselor_id, member_id, mode, status, notes } = session;

  // Ensure that member_id and counselor_id are integers before updating
  if (isNaN(member_id) || isNaN(counselor_id)) {
    throw new Error('Invalid member or counselor ID');
  }

  return await db.query(`
    UPDATE counseling_sessions 
    SET date = $1, time = $2, counselor_id = $3, member_id = $4, mode = $5, status = $6, notes = $7 
    WHERE id = $8 
    RETURNING *
  `, [date, time, counselor_id, member_id, mode, status, notes, id]);
};

// ✅ Delete a session
exports.deleteSession = async (id) => {
  return await db.query(`DELETE FROM counseling_sessions WHERE id = $1`, [id]);
};
