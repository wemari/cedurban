// models/expenseModel.js
const pool = require('../config/db');

const Expense = {
  async create(data) {
    const {
      member_id, amount, department, category, payment_method,
      transaction_date, notes, receipt_url, approved_by, approved_at
    } = data;
    const res = await pool.query(
      `INSERT INTO public.expense_transactions
        (member_id, amount, department, category, payment_method,
         transaction_date, notes, receipt_url, approved_by, approved_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [member_id, amount, department, category, payment_method,
       transaction_date, notes, receipt_url, approved_by, approved_at]
    );
    return res.rows[0];
  },

  async findAll(limit = 50, offset = 0) {
    const res = await pool.query(
      `SELECT * FROM public.expense_transactions
       ORDER BY transaction_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.rows;
  },

  async findById(id) {
    const res = await pool.query(
      `SELECT * FROM public.expense_transactions WHERE id = $1`,
      [id]
    );
    return res.rows[0];
  },

  async update(id, data) {
    const {
      member_id, amount, department, category, payment_method,
      transaction_date, notes, receipt_url, approved_by, approved_at
    } = data;
    const res = await pool.query(
      `UPDATE public.expense_transactions
       SET member_id=$2, amount=$3, department=$4, category=$5,
           payment_method=$6, transaction_date=$7, notes=$8,
           receipt_url=$9, approved_by=$10, approved_at=$11,
           updated_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [id, member_id, amount, department, category, payment_method,
       transaction_date, notes, receipt_url, approved_by, approved_at]
    );
    return res.rows[0];
  },

  async delete(id) {
    const res = await pool.query(
      `DELETE FROM public.expense_transactions WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rows[0];
  }
};

module.exports = Expense;
