const db = require('../config/db');

exports.getByMember = async (member_id) => {
  const result = await db.query(`
    SELECT
      mr.id,
      mr.member_id,
      mr.template_id,
      mr.milestone_name,
      mr.completed_at,
      COALESCE(mt.name, mr.milestone_name) AS template_name
    FROM milestone_records mr
    LEFT JOIN milestone_templates mt ON mr.template_id = mt.id
    WHERE mr.member_id = $1
    ORDER BY mr.completed_at DESC
  `, [member_id]);
  return result.rows;
};



// 🆕 Automatically fills milestone_name from the template
exports.create = async (member_id, template_id) => {
  const result = await db.query(`
    INSERT INTO milestone_records (member_id, template_id, milestone_name)
    SELECT $1, $2, name
    FROM milestone_templates
    WHERE id = $2
    RETURNING *;
  `, [member_id, template_id]);

  return result.rows[0];
};


exports.delete = async (id) => {
  const result = await db.query(`
    DELETE FROM milestone_records WHERE id = $1
    RETURNING *;
  `, [id]);

  return result.rows[0];
};


exports.getAll = async () => {
  const result = await db.query(`
    SELECT
      mr.id,
      mr.member_id,
      mr.template_id,
      mr.milestone_name,
      mr.completed_at,
      COALESCE(mt.name, mr.milestone_name) AS template_name
    FROM milestone_records mr
    LEFT JOIN milestone_templates mt ON mr.template_id = mt.id
    ORDER BY mr.completed_at DESC
  `);
  return result.rows;
};
