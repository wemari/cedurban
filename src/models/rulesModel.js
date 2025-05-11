// src/models/rulesModel.js
const db = require('../config/db');

exports.getAllRules = () =>
  db.query('SELECT * FROM cell_group_rules ORDER BY min_size')
    .then(res => res.rows);

exports.createRule = ({ min_size, max_size, split_into, designation_level }) =>
  db.query(
    `INSERT INTO cell_group_rules
       (min_size, max_size, split_into, designation_level)
     VALUES ($1, $2, $3, $4) RETURNING *;`,
    [min_size, max_size, split_into, designation_level]
  ).then(res => res.rows[0]);

exports.updateRule = (id, data) =>
  db.query(
    `UPDATE cell_group_rules
     SET min_size = $1, max_size = $2, split_into = $3, designation_level = $4
     WHERE id = $5 RETURNING *;`,
    [data.min_size, data.max_size, data.split_into, data.designation_level, id]
  ).then(res => res.rows[0]);

exports.deleteRule = id =>
  db.query('DELETE FROM cell_group_rules WHERE id = $1 RETURNING *;', [id])
    .then(res => res.rows[0]);