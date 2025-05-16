// models/currencyModel.js
const pool = require('../config/db');

const Currency = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT id, code, name, symbol
         FROM public.currencies
        ORDER BY code`
    );
    return rows;
  },

  async create({ code, name, symbol }) {
    const { rows } = await pool.query(
      `INSERT INTO public.currencies (code, name, symbol)
       VALUES ($1, $2, $3)
       RETURNING id, code, name, symbol`,
      [code, name, symbol]
    );
    return rows[0];
  },

  async update(id, { code, name, symbol }) {
    const { rows } = await pool.query(
      `UPDATE public.currencies
          SET code=$2, name=$3, symbol=$4
        WHERE id=$1
        RETURNING id, code, name, symbol`,
      [id, code, name, symbol]
    );
    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM public.currencies WHERE id=$1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
};

module.exports = Currency;
