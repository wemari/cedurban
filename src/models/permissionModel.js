const db = require('../config/db');

class PermissionModel {
  static async create({ name, description }) {
    const res = await db.query(
      `INSERT INTO permissions (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );
    return res.rows[0];
  }

  static async getAll() {
    const res = await db.query(`SELECT * FROM permissions ORDER BY id`);
    return res.rows;
  }

  static async getById(id) {
    const res = await db.query(`SELECT * FROM permissions WHERE id = $1`, [id]);
    return res.rows[0];
  }

  static async update(id, { name, description }) {
    const res = await db.query(
      `UPDATE permissions SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
      [name, description, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    await db.query(`DELETE FROM permissions WHERE id = $1`, [id]);
  }
}

module.exports = PermissionModel;
