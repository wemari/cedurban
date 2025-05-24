// src/models/settingModel.js
const pool = require('../config/db');

const Setting = {
  /** Key/value store for arbitrary settings */
  async get(key) {
    const { rows } = await pool.query(
      `SELECT value FROM public.settings WHERE key = $1`, [key]
    );
    return rows[0]?.value || null;
  },

  async set(key, value) {
    const { rows } = await pool.query(
      `INSERT INTO public.settings (key, value)
         VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value
       RETURNING *`,
      [key, value]
    );
    return rows[0];
  },

  /** Return list of all user tables */
  async listTables() {
    const { rows } = await pool.query(`
      SELECT table_name
        FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_type   = 'BASE TABLE'
       ORDER BY table_name
    `);
    return rows.map(r => r.table_name);
  },

  /** Return list of columns for one table */
  async listColumnsForTable(tableName) {
    const { rows } = await pool.query(`
      SELECT column_name
        FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name   = $1
       ORDER BY ordinal_position
    `, [tableName]);
    return rows.map(r => r.column_name);
  }
};

module.exports = Setting;
