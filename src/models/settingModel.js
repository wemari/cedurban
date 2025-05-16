// models/settingModel.js
const pool = require('../config/db');

const Setting = {
  async get(key) {
    const { rows } = await pool.query(
      `SELECT value FROM public.settings WHERE key = $1`,
      [key]
    );
    return rows[0]?.value || null;
  },

  async set(key, value) {
    const { rows } = await pool.query(
      `INSERT INTO public.settings
        (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
       RETURNING *`,
      [key, value]
    );
    return rows[0];
  }
};

module.exports = Setting;
