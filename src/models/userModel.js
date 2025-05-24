const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class UserModel {
  static async create({ email }) {
    // Generate a strong random 12-character password
    const tempPassword = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    const hashedTemp = await bcrypt.hash(tempPassword, 10);

    const res = await db.query(
      `INSERT INTO users
         (email, password_hash, temp_password, password_reset_required)
       VALUES ($1, $2, $2, TRUE)
       RETURNING id, email`,
      [email, hashedTemp]
    );

    return {
      ...res.rows[0],
      tempPassword // plain text shown in response
    };
  }


  static async getAll() {
    const res = await db.query(
      `SELECT 
         u.id,
         u.email,
         u.temp_password,
         u.is_active,
         u.lockout_until,
         COALESCE(
           json_agg(json_build_object('id', r.id, 'name', r.name))
           FILTER (WHERE r.id IS NOT NULL),
           '[]'
         ) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r      ON r.id     = ur.role_id
       GROUP BY u.id
       ORDER BY u.id`
    );
    return res.rows;
  }

  static async getById(id) {
    const res = await db.query(
      `SELECT 
         u.id, 
         u.email,
         u.temp_password,
         u.is_active,
         u.lockout_until,
         COALESCE(
           json_agg(json_build_object('id', r.id, 'name', r.name))
           FILTER (WHERE r.id IS NOT NULL),
           '[]'
         ) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r      ON r.id     = ur.role_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );
    return res.rows[0];
  }

  static async getById(id) {
    const res = await db.query(
      `SELECT 
         u.id, 
         u.email, 
         COALESCE(
           json_agg(
             json_build_object('id', r.id, 'name', r.name)
           ) FILTER (WHERE r.id IS NOT NULL),
           '[]'
         ) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );
    return res.rows[0];
  }

  static async getByEmail(email) {
    const res = await db.query(
      `SELECT 
         u.id,
         u.email,
         u.password_hash,
         u.temp_password,
         u.password_reset_required,
         u.failed_login_attempts,
         u.lockout_until,
         m.id AS "memberId",
         COALESCE(
           json_agg(
             json_build_object('id', r.id, 'name', r.name)
           ) FILTER (WHERE r.id IS NOT NULL),
           '[]'
         ) AS roles,
         MAX(r.name) AS "userRole"
       FROM users u
       LEFT JOIN members m ON m.user_id = u.id
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       WHERE u.email = $1
       GROUP BY u.id, m.id`,
      [email]
    );
    return res.rows[0];
  }

  static async update(id, { email, password }) {
    const updates = [];
    const params = [];
    let idx = 1;

    if (email) {
      updates.push(`email = $${idx++}`);
      params.push(email);
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${idx++}`);
      params.push(hash);
    }

    if (!updates.length) return null;

    params.push(id);
    const res = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email`,
      params
    );
    return res.rows[0];
  }

  static async delete(id) {
    await db.query(`DELETE FROM users WHERE id = $1`, [id]);
  }

  static async assignRole(userId, roleId) {
    await db.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, roleId]
    );
  }

  static async removeRole(userId, roleId) {
    await db.query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, roleId]
    );
  }

  static async getRoles(userId) {
    const res = await db.query(
      `SELECT r.name FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
      [userId]
    );
    return res.rows.map(r => r.name);
  }

  static async getPermissions(userId) {
    const res = await db.query(
      `SELECT p.name FROM permissions p
         JOIN role_permissions rp ON rp.permission_id = p.id
         JOIN roles r ON rp.role_id = r.id
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
      [userId]
    );
    return res.rows.map(p => p.name);
  }

  static async incrementFailedAttempts(userId) {
    await db.query(
      `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1`,
      [userId]
    );
  }

  static async resetFailedAttempts(userId) {
    await db.query(
      `UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = $1`,
      [userId]
    );
  }

  static async lockAccount(userId, minutes) {
    await db.query(
      `UPDATE users SET lockout_until = NOW() + ($2 || ' minutes')::interval WHERE id = $1`,
      [userId, minutes]
    );
  }

  static async updatePassword(userId, passwordHash) {
    await db.query(
      `UPDATE users
         SET password_hash = $2,
             temp_password = NULL,
             password_reset_required = false
         WHERE id = $1`,
      [userId, passwordHash]
    );
  }

  static async resetPassword(email, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    const res = await db.query(
      `UPDATE users
         SET password_hash = $1,
             temp_password = NULL,
             password_reset_required = false
         WHERE email = $2
         RETURNING id, email`,
      [hash, email]
    );
    return res.rows[0];
  }



static async createWithPassword({ email, passwordHash }) {
  const res = await db.query(
    `INSERT INTO users (email, password_hash, password_reset_required)
     VALUES ($1, $2, FALSE)
     RETURNING id, email`,
    [email, passwordHash]
  );

  return res.rows[0];
}

static async createWithoutPassword(email) {
  const dummyPassword = await bcrypt.hash(crypto.randomBytes(12).toString('hex'), 10);

  const res = await db.query(
    `INSERT INTO users (email, password_hash, password_reset_required, is_verified)
     VALUES ($1, $2, TRUE, FALSE)
     RETURNING id, email`,
    [email, dummyPassword]
  );
  return res.rows[0];
}


}
module.exports = UserModel;