// models/bankModel.js
const pool = require('../config/db');

const Bank = {
  async findAll() {
    const { rows } = await pool.query(`SELECT * FROM public.banks ORDER BY name`);
    return rows;
  },
  async create({ name, swift_code }) {
    const { rows } = await pool.query(
      `INSERT INTO public.banks (name,swift_code) VALUES ($1,$2) RETURNING *`,
      [name, swift_code]
    );
    return rows[0];
  },
  async update(id, { name, swift_code }) {
    const { rows } = await pool.query(
      `UPDATE public.banks SET name=$2,swift_code=$3 WHERE id=$1 RETURNING *`,
      [id, name, swift_code]
    );
    return rows[0];
  },
  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM public.banks WHERE id=$1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
};

module.exports = Bank;
