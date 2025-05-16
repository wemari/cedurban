const db = require('../config/db');

class RoleModel {
  static async create({ name, description }) {
    const res = await db.query(
      `INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );
    return res.rows[0];
  }

  static async getAll() {
    const res = await db.query(`
      SELECT 
        r.id as role_id, r.name as role_name, r.description,
        p.id as permission_id, p.name as permission_name
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      ORDER BY r.id
    `);
  
    const rolesMap = new Map();
  
    for (const row of res.rows) {
      if (!rolesMap.has(row.role_id)) {
        rolesMap.set(row.role_id, {
          id: row.role_id,
          name: row.role_name,
          description: row.description,
          permissions: []
        });
      }
      if (row.permission_id) {
        rolesMap.get(row.role_id).permissions.push({
          id: row.permission_id,
          name: row.permission_name
        });
      }
    }
  
    return Array.from(rolesMap.values());
  }
  

  static async getById(id) {
    const res = await db.query(`SELECT * FROM roles WHERE id = $1`, [id]);
    return res.rows[0];
  }

  static async update(id, { name, description }) {
    const res = await db.query(
      `UPDATE roles SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
      [name, description, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    await db.query(`DELETE FROM roles WHERE id = $1`, [id]);
  }

  static async addPermission(roleId, permissionId) {
    await db.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [roleId, permissionId]
    );
  }

  static async removePermission(roleId, permissionId) {
    await db.query(
      `DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2`,
      [roleId, permissionId]
    );
  }
}

module.exports = RoleModel;
