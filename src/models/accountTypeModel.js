// models/accountTypeModel.js
const pool = require('../config/db');

const AccountType = {
  async findAll() {
    const { rows } = await pool.query(`SELECT * FROM public.account_types ORDER BY name`);
    return rows;
  },
  async create({ name }) {
    const { rows } = await pool.query(
      `INSERT INTO public.account_types (name) VALUES ($1) RETURNING *`,
      [name]
    );
    return rows[0];
  },
  async update(id, { name }) {
    const { rows } = await pool.query(
      `UPDATE public.account_types SET name=$2 WHERE id=$1 RETURNING *`,
      [id, name]
    );
    return rows[0];
  },
  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM public.account_types WHERE id=$1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
};

module.exports = AccountType;
