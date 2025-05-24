// models/incomeModel.js
const pool = require('../config/db'); // your pg.Pool instance

const Income = {
  async create(data) {
    const {
      member_id, amount, category, method,
      transaction_date, notes, is_recurring, recurring_interval
    } = data;
    const result = await pool.query(
      `INSERT INTO public.income_transactions
         (member_id, amount, category, method, transaction_date, notes, is_recurring, recurring_interval)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [member_id, amount, category, method, transaction_date, notes, is_recurring, recurring_interval]
    );
    return result.rows[0];
  },

  async findAll(limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM public.income_transactions
       ORDER BY transaction_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT * FROM public.income_transactions WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const {
      member_id, amount, category, method,
      transaction_date, notes, is_recurring, recurring_interval
    } = data;
    const result = await pool.query(
      `UPDATE public.income_transactions
       SET member_id=$2, amount=$3, category=$4, method=$5,
           transaction_date=$6, notes=$7, is_recurring=$8,
           recurring_interval=$9, updated_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [id, member_id, amount, category, method,
       transaction_date, notes, is_recurring, recurring_interval]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM public.income_transactions WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }
};

module.exports = Income;
