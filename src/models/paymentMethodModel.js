// models/paymentMethodModel.js
const pool = require('../config/db');

const PaymentMethod = {
  async findAll() {
    const { rows } = await pool.query(`SELECT * FROM public.payment_methods ORDER BY name`);
    return rows;
  },
  async create({ name }) {
    const { rows } = await pool.query(
      `INSERT INTO public.payment_methods (name) VALUES ($1) RETURNING *`,
      [name]
    );
    return rows[0];
  },
  async update(id, { name }) {
    const { rows } = await pool.query(
      `UPDATE public.payment_methods SET name=$2 WHERE id=$1 RETURNING *`,
      [id, name]
    );
    return rows[0];
  },
  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM public.payment_methods WHERE id=$1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
};

module.exports = PaymentMethod;
