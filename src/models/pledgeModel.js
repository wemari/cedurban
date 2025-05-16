// server/models/pledgeModel.js
const pool = require('../config/db');

const Pledge = {
  async findByMember(memberId) {
    const { rows } = await pool.query(`
      SELECT id, amount, fulfilled, status, created_at
        FROM pledges
       WHERE member_id = $1
       ORDER BY created_at DESC
    `, [memberId]);
    return rows;
  },

  async create({ member_id, amount, description }) {
    const { rows } = await pool.query(`
      INSERT INTO pledges
        (member_id, amount, description, fulfilled, status, created_at)
      VALUES ($1,$2,$3,0,'pending',NOW())
      RETURNING id, amount, fulfilled, status, created_at
    `, [member_id, amount, description]);
    return rows[0];
  }
};

module.exports = Pledge;
