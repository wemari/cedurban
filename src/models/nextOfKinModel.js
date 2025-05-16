// src/models/nextOfKinModel.js

const db = require('../config/db');

// Create Next of Kin
exports.createNextOfKin = async (data) => {
  const { member_id, name, contact, relationship } = data;
  const result = await db.query(`
    INSERT INTO next_of_kin (member_id, name, contact, relationship)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `, [member_id, name, contact, relationship]);
  return result.rows[0];
};

// Get All Next of Kin
exports.getAllNextOfKin = async () => {
  const result = await db.query('SELECT * FROM next_of_kin ORDER BY id DESC');
  return result.rows;
};

// Get Next of Kin by ID
exports.getNextOfKinById = async (id) => {
  const result = await db.query('SELECT * FROM next_of_kin WHERE id = $1', [id]);
  return result.rows[0];
};

// Update Next of Kin
exports.updateNextOfKin = async (id, data) => {
  const { name, contact, relationship } = data;
  const result = await db.query(`
    UPDATE next_of_kin
    SET name = $1, contact = $2, relationship = $3
    WHERE id = $4
    RETURNING *;
  `, [name, contact, relationship, id]);
  return result.rows[0];
};

// Delete Next of Kin
exports.deleteNextOfKin = async (id) => {
  const result = await db.query('DELETE FROM next_of_kin WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};
