// models/budgetModel.js
const pool = require('../config/db');

const Budget = {
  async create(data) {
    const { department, category, period_start, period_end, amount } = data;
    const res = await pool.query(
      `INSERT INTO public.budgets
        (department, category, period_start, period_end, amount)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [department, category, period_start, period_end, amount]
    );
    return res.rows[0];
  },

  async findAll(limit = 50, offset = 0) {
    const res = await pool.query(
      `SELECT * FROM public.budgets
       ORDER BY period_start DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.rows;
  },

  async findById(id) {
    const res = await pool.query(
      `SELECT * FROM public.budgets WHERE id = $1`,
      [id]
    );
    return res.rows[0];
  },

  async update(id, data) {
    const { department, category, period_start, period_end, amount } = data;
    const res = await pool.query(
      `UPDATE public.budgets
       SET department=$2, category=$3,
           period_start=$4, period_end=$5,
           amount=$6, updated_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [id, department, category, period_start, period_end, amount]
    );
    return res.rows[0];
  },

  async delete(id) {
    const res = await pool.query(
      `DELETE FROM public.budgets WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rows[0];
  }
};

module.exports = Budget;
