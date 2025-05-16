// src/models/designationModel.js
const db = require('../config/db');

exports.getAll = () =>
  db.query('SELECT * FROM designations ORDER BY rank')
    .then(res => res.rows);

exports.create = ({ name, rank }) =>
  db.query(
    'INSERT INTO designations (name, rank) VALUES ($1, $2) RETURNING *;', [name, rank]
  ).then(res => res.rows[0]);

exports.update = (id, { name, rank }) =>
  db.query(
    'UPDATE designations SET name=$1, rank=$2 WHERE id=$3 RETURNING *;', [name, rank, id]
  ).then(res => res.rows[0]);

exports.delete = id =>
  db.query('DELETE FROM designations WHERE id=$1 RETURNING *;', [id])
    .then(res => res.rows[0]);