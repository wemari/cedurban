// src/models/memberFamilyModel.js

const db = require('../config/db');

// Create Family Link
exports.createFamilyLink = async (data) => {
  const { member_id, relative_id, relationship } = data;
  const result = await db.query(`
    INSERT INTO member_family (member_id, relative_id, relationship)
    VALUES ($1, $2, $3)
    RETURNING *;
  `, [member_id, relative_id, relationship]);
  return result.rows[0];
};

// Get All Family Links with relative names
exports.getAllFamilyLinks = async () => {
  const result = await db.query(`
    SELECT 
      mf.*, 
      m.first_name AS relative_first_name, 
      m.surname AS relative_surname
    FROM member_family mf
    JOIN members m ON m.id = mf.relative_id
    ORDER BY mf.id DESC;
  `);
  return result.rows;
};


// Get Family Link by ID
exports.getFamilyLinkById = async (id) => {
  const result = await db.query('SELECT * FROM member_family WHERE id = $1', [id]);
  return result.rows[0];
};

// Update Family Link
exports.updateFamilyLink = async (id, data) => {
  const { relationship } = data;
  const result = await db.query(`
    UPDATE member_family
    SET relationship = $1
    WHERE id = $2
    RETURNING *;
  `, [relationship, id]);
  return result.rows[0];
};

// Delete Family Link
exports.deleteFamilyLink = async (id) => {
  const result = await db.query('DELETE FROM member_family WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};
