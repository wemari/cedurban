const db = require('../config/db');

// Get counseling sessions for a member
exports.getMemberCounselings = async (memberId) => {
  return await db.query(`
    SELECT cs.*, 
           CONCAT(c.first_name, ' ', c.surname) AS counselor_name, 
           mc.id AS member_counseling_id
    FROM member_counseling mc
    JOIN counseling_sessions cs ON mc.counseling_id = cs.id
    JOIN members c ON cs.counselor_id = c.id
    WHERE mc.member_id = $1
    ORDER BY cs.date DESC
  `, [memberId]);
};

// Create a counseling session and link to member
exports.createMemberCounseling = async (memberId, sessionData) => {
  const { date, time, counselor_id, mode, status, notes } = sessionData;

  const sessionResult = await db.query(`
    INSERT INTO counseling_sessions (member_id, counselor_id, date, time, mode, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
  `, [memberId, counselor_id, date, time, mode, status, notes]);

  const sessionId = sessionResult.rows[0].id;

  await db.query(`
    INSERT INTO member_counseling (member_id, counseling_id)
    VALUES ($1, $2)
  `, [memberId, sessionId]);

  return sessionResult.rows[0];
};

// Update counseling session
exports.updateMemberCounseling = async (sessionId, updatedSession) => {
  return await db.query(`
    UPDATE counseling_sessions SET
      date = $1,
      time = $2,
      counselor_id = $3,
      mode = $4,
      status = $5,
      notes = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7 RETURNING *
  `, [
    updatedSession.date,
    updatedSession.time,
    updatedSession.counselor_id,
    updatedSession.mode,
    updatedSession.status,
    updatedSession.notes,
    sessionId
  ]);
};

// Delete counseling session and its mapping
exports.deleteMemberCounseling = async (memberCounselingId, sessionId) => {
  await db.query(`DELETE FROM member_counseling WHERE id = $1`, [memberCounselingId]);
  await db.query(`DELETE FROM counseling_sessions WHERE id = $1`, [sessionId]);
};
