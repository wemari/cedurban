const db = require('../config/db');

exports.getAll = async () => {
  const result = await db.query(`SELECT * FROM milestone_templates ORDER BY name`);
  return result.rows;
};

exports.create = async (name, required, description) => {
  const result = await db.query(`
    INSERT INTO milestone_templates (name, required_for_promotion, description)
    VALUES ($1, $2, $3)
    RETURNING *;
  `, [name, required, description]);
  return result.rows[0];
};

exports.update = async (id, name, required, description) => {
  const result = await db.query(`
    UPDATE milestone_templates
    SET name = $1, required_for_promotion = $2, description = $3
    WHERE id = $4 RETURNING *;
  `, [name, required, description, id]);
  return result.rows[0];
};

exports.delete = async (id) => {
  const result = await db.query(`DELETE FROM milestone_templates WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
};
