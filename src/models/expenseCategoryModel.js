// models/expenseCategoryModel.js
const pool = require('../config/db');

const ExpenseCategory = {
  async findAll() {
    const { rows } = await pool.query(`SELECT * FROM public.expense_categories ORDER BY name`);
    return rows;
  },
  async create({ name }) {
    const { rows } = await pool.query(
      `INSERT INTO public.expense_categories (name) VALUES ($1) RETURNING *`,
      [name]
    );
    return rows[0];
  },
  async update(id, { name }) {
    const { rows } = await pool.query(
      `UPDATE public.expense_categories SET name=$2 WHERE id=$1 RETURNING *`,
      [id, name]
    );
    return rows[0];
  },
  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM public.expense_categories WHERE id=$1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
};

module.exports = ExpenseCategory;
