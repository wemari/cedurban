const db = require('../config/db');

const ImportColumn = {
  async getAll() {
    const { rows } = await db.query('SELECT * FROM import_columns ORDER BY id');
    return rows;
  },

  async getById(id) {
    const { rows } = await db.query('SELECT * FROM import_columns WHERE id = $1', [id]);
    return rows[0];
  },

  async create({ table_name, column_name, label, required }) {
    const { rows } = await db.query(
      `INSERT INTO import_columns (table_name, column_name, label, required)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [table_name, column_name, label, required]
    );
    return rows[0];
  },

  async update(id, { table_name, column_name, label, required }) {
    const { rows } = await db.query(
      `UPDATE import_columns
       SET table_name = $1, column_name = $2, label = $3, required = $4
       WHERE id = $5
       RETURNING *`,
      [table_name, column_name, label, required, id]
    );
    return rows[0];
  },

  async remove(id) {
    await db.query('DELETE FROM import_columns WHERE id = $1', [id]);
    return { success: true };
  },

  // 🔽 New method: Get required columns for a specific table
  async getRequiredByTable(tableName) {
    const { rows } = await db.query(
      `SELECT column_name, label
       FROM import_columns
       WHERE table_name = $1 AND required = TRUE
       ORDER BY id`,
      [tableName]
    );
    return rows;
  },

  /** 🔽 New: fetch all columns (with label+required) for a given table */
  async getAllByTable(tableName) {
    const { rows } = await db.query(
      `SELECT column_name, label, required
         FROM import_columns
        WHERE table_name = $1
        ORDER BY id`,
      [tableName]
    );
    return rows; // [{ column_name, label, required }, …]
  }
};

module.exports = ImportColumn;


