// models/incomeCategoryModel.js
const pool = require('../config/db');

const IncomeCategory = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT id, name
         FROM public.income_categories
        ORDER BY name`
    );
    return rows;
  },

  async create({ name }) {
    const { rows } = await pool.query(
      `INSERT INTO public.income_categories (name)
       VALUES ($1)
       RETURNING id, name`,
      [name]
    );
    return rows[0];
  },

  async update(id, { name }) {
    const { rows } = await pool.query(
      `UPDATE public.income_categories
          SET name = $2
        WHERE id = $1
        RETURNING id, name`,
      [id, name]
    );
    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM public.income_categories
        WHERE id = $1
        RETURNING id`,
      [id]
    );
    return rows[0];
  }
};

module.exports = IncomeCategory;
