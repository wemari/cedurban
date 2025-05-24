// models/accountModel.js
const pool = require('../config/db');

const Account = {
  async create(data) {
    const { name, type, bank_name, account_number, balance } = data;
    const res = await pool.query(
      `INSERT INTO public.accounts
         (name, type, bank_name, account_number, balance)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [name, type, bank_name, account_number, balance]
    );
    return res.rows[0];
  },

  async findAll(limit = 50, offset = 0) {
    const res = await pool.query(
      `SELECT * FROM public.accounts
       ORDER BY name
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.rows;
  },

  async findById(id) {
    const res = await pool.query(
      `SELECT * FROM public.accounts WHERE id = $1`,
      [id]
    );
    return res.rows[0];
  },

  async update(id, data) {
    const { name, type, bank_name, account_number, balance } = data;
    const res = await pool.query(
      `UPDATE public.accounts
       SET name=$2, type=$3, bank_name=$4,
           account_number=$5, balance=$6,
           updated_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [id, name, type, bank_name, account_number, balance]
    );
    return res.rows[0];
  },

  async delete(id) {
    const res = await pool.query(
      `DELETE FROM public.accounts WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rows[0];
  }
};

module.exports = Account;
