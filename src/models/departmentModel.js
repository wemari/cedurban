// src/models/departmentModel.js

const db = require('../config/db');

// Create
exports.createDepartment = async (data) => {
  const { name, description, leader_id } = data;
  const result = await db.query(`
    INSERT INTO departments (name, description, leader_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `, [name, description || null, leader_id || null]);
  return result.rows[0];
};


// Get All
exports.getAllDepartments = async () => {
  const result = await db.query(`
    SELECT id, name, description, leader_id
    FROM departments
    ORDER BY id DESC
  `);
  return result.rows;
};


// Get by ID
exports.getDepartmentById = async (id) => {
  const result = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
  return result.rows[0];
};

// Update
exports.updateDepartment = async (id, data) => {
  const { name, description, leader_id } = data;
  const result = await db.query(`
    UPDATE departments
    SET name = $1,
        description = $2,
        leader_id = $3
    WHERE id = $4
    RETURNING *;
  `, [name, description || null, leader_id || null, id]);
  return result.rows[0];
};


// Delete
exports.deleteDepartment = async (id) => {
  const result = await db.query('DELETE FROM departments WHERE id = $1 RETURNING *;', [id]);
  return result.rows[0];
};


// src/models/departmentModel.js

exports.getDepartmentsWithMembers = async () => {
  try {
    const result = await db.query(`
      SELECT d.id AS department_id, d.name, d.description, d.leader_id,
             md.id AS membership_id, md.member_id, md.role, md.date_joined,
             m.first_name, m.surname, m.email, m.contact_primary
      FROM departments d
      LEFT JOIN member_department md ON md.department_id = d.id
      LEFT JOIN members m ON m.id = md.member_id
      ORDER BY d.id DESC;
    `);

    console.log('DB query successful:', result.rows.length);

    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.department_id]) {
        grouped[row.department_id] = {
          id: row.department_id,
          name: row.name,
          description: row.description,
          leader_id: row.leader_id,
          members: [],
        };
      }

      if (row.member_id) {
        grouped[row.department_id].members.push({
          membership_id: row.membership_id,
          member_id: row.member_id,
          first_name: row.first_name,
          surname: row.surname,
          email: row.email,
          contact_primary: row.contact_primary,
          designation: row.role,
          date_joined: row.date_joined,
        });
      }
    });

    return Object.values(grouped);
  } catch (err) {
    console.error('Model error:', err); // <-- Add this
    throw err; // Re-throw to be caught in controller
  }
};
