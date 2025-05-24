const db = require('../config/db');

module.exports = {
  async getByMemberId(memberId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { rows } = await db.query(
      `SELECT * FROM notifications WHERE member_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [memberId, limit, offset]
    );
    return rows;
  },

  async countByMemberId(memberId) {
    const { rows } = await db.query(
      `SELECT COUNT(*) AS total FROM notifications WHERE member_id = $1`,
      [memberId]
    );
    return Number(rows[0].total);
  },

  async markAsRead(id) {
    return db.query(`UPDATE notifications SET is_read = true WHERE id = $1`, [id]);
  },

  async markAllAsRead(memberId) {
    return db.query(`UPDATE notifications SET is_read = true WHERE member_id = $1`, [memberId]);
  },

  async getById(id) {
    const { rows } = await db.query('SELECT * FROM notifications WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create(payload) {
    const fields = [];
    const values = [];
    const placeholders = [];

    let index = 1;
    for (const [key, value] of Object.entries(payload)) {
      fields.push(key);
      values.push(value);
      placeholders.push(`$${index++}`);
    }

    const { rows } = await db.query(
      `INSERT INTO notifications (${fields.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      values
    );

    return rows[0];
  }
};
