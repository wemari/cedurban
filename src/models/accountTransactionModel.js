// models/accountTransactionModel.js
const pool = require('../config/db');

const AccountTransaction = {
  async create(data) {
    const {
      account_id, related_income_id, related_expense_id,
      type, amount, transaction_date, description
    } = data;
    const res = await pool.query(
      `INSERT INTO public.account_transactions
        (account_id, related_income_id, related_expense_id, type, amount, transaction_date, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [account_id, related_income_id, related_expense_id, type, amount, transaction_date, description]
    );
    return res.rows[0];
  },

  async findAll(limit = 50, offset = 0) {
    const res = await pool.query(
      `SELECT * FROM public.account_transactions
       ORDER BY transaction_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.rows;
  },

  async findById(id) {
    const res = await pool.query(
      `SELECT * FROM public.account_transactions WHERE id = $1`,
      [id]
    );
    return res.rows[0];
  },

  async update(id, data) {
    const {
      account_id, related_income_id, related_expense_id,
      type, amount, transaction_date, description
    } = data;
    const res = await pool.query(
      `UPDATE public.account_transactions
       SET account_id=$2, related_income_id=$3, related_expense_id=$4,
           type=$5, amount=$6, transaction_date=$7, description=$8
       WHERE id=$1
       RETURNING *`,
      [id, account_id, related_income_id, related_expense_id, type, amount, transaction_date, description]
    );
    return res.rows[0];
  },

  async delete(id) {
    const res = await pool.query(
      `DELETE FROM public.account_transactions WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rows[0];
  }
};

module.exports = AccountTransaction;
