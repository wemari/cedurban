
const db = require('../config/db');

exports.create = async ({ member_id, event_id, method, metadata = null, proof_url = null }) => {
    const result = await db.query(
        `INSERT INTO attendances (member_id, event_id, method, metadata, proof_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [member_id, event_id, method, metadata, proof_url]
    );
    return result.rows[0];
};

exports.findByEvent = async (event_id) => {
    const result = await db.query(
        `SELECT a.*, m.first_name, m.surname FROM attendances a
         JOIN members m ON a.member_id = m.id
         WHERE a.event_id = $1`, [event_id]);
    return result.rows;
};

exports.findByMember = async (member_id) => {
    const result = await db.query(
        `SELECT a.*, e.name FROM attendances a
         JOIN events e ON a.event_id = e.id
         WHERE a.member_id = $1`, [member_id]);
    return result.rows;
};
