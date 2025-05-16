const db = require('../config/db');

exports.createAssignment = async ({ member_id, department_id, role, date_joined }) => {
  const result = await db.query(`
    INSERT INTO member_department (member_id, department_id, role, date_joined)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `, [member_id, department_id, role, date_joined]);
  return result.rows[0];
};

exports.getAllAssignments = async () => {
  const result = await db.query('SELECT * FROM member_department ORDER BY id DESC');
  return result.rows;
};

exports.getAssignmentById = async (id) => {
  const result = await db.query('SELECT * FROM member_department WHERE id = $1', [id]);
  return result.rows[0];
};

exports.updateAssignment = async (id, { member_id, department_id, role, date_joined }) => {
  const result = await db.query(`
    UPDATE member_department
    SET member_id = $1,
        department_id = $2,
        role = $3,
        date_joined = $4
    WHERE id = $5
    RETURNING *;
  `, [member_id, department_id, role, date_joined, id]);
  return result.rows[0];
};

exports.deleteAssignment = async (id) => {
  const result = await db.query('DELETE FROM member_department WHERE id = $1 RETURNING *;', [id]);
  return result.rows[0];
};
