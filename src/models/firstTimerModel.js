const db = require('../config/db');

exports.getAll = async () => {
  const result = await db.query(`
    SELECT
      ft.id,
      ft.member_id,
      TO_CHAR(ft.registration_date, 'YYYY-MM-DD') AS registration_date,
      ft.how_heard,
      CONCAT(m.first_name, ' ', m.surname) AS member_name
    FROM first_timers ft
    LEFT JOIN members m ON m.id = ft.member_id
    ORDER BY ft.registration_date DESC;
  `);
  return result.rows;
};

exports.create = async (data) => {
  const { member_id, registration_date, how_heard } = data;
  const result = await db.query(`
    INSERT INTO first_timers (member_id, registration_date, how_heard)
    VALUES ($1, $2, $3)
    RETURNING *;
  `, [member_id, registration_date, how_heard]);
  return result.rows[0];
};

exports.update = async (id, data) => {
  const { member_id, registration_date, how_heard } = data;
  const result = await db.query(`
    UPDATE first_timers
    SET member_id = $1, registration_date = $2, how_heard = $3
    WHERE id = $4 RETURNING *;
  `, [member_id, registration_date, how_heard, id]);
  return result.rows[0];
};

exports.delete = async (id) => {
  const result = await db.query(`DELETE FROM first_timers WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
};
