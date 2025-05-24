const db = require('../config/db');

// Get all new converts with member name and formatted dates
exports.getAll = async () => {
  const result = await db.query(`
   SELECT
  nc.id,
  nc.member_id,
  TO_CHAR(nc.conversion_date, 'YYYY-MM-DD') AS conversion_date,
  nc.conversion_type,
  nc.baptism_scheduled,
  TO_CHAR(nc.baptism_date, 'YYYY-MM-DD') AS baptism_date,
  CONCAT(m.first_name, ' ', m.surname) AS member_name
FROM new_converts nc
LEFT JOIN members m ON m.id = nc.member_id
ORDER BY nc.conversion_date DESC;

  `);
  console.log(result.rows);  // Log to inspect the rows returned
  return result.rows;
};

// Create
exports.create = async (data) => {
  const { member_id, conversion_date, conversion_type, baptism_scheduled, baptism_date } = data;
  const result = await db.query(`
    INSERT INTO new_converts (member_id, conversion_date, conversion_type, baptism_scheduled, baptism_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `, [member_id, conversion_date, conversion_type, baptism_scheduled, baptism_date]);
  return result.rows[0];
};

// Update
exports.update = async (id, data) => {
  const { member_id, conversion_date, conversion_type, baptism_scheduled, baptism_date } = data;
  const result = await db.query(`
    UPDATE new_converts
    SET member_id = $1, conversion_date = $2, conversion_type = $3, baptism_scheduled = $4, baptism_date = $5
    WHERE id = $6 RETURNING *;
  `, [member_id, conversion_date, conversion_type, baptism_scheduled, baptism_date, id]);
  return result.rows[0];
};

// Delete
exports.delete = async (id) => {
  const result = await db.query('DELETE FROM new_converts WHERE id = $1 RETURNING *;', [id]);
  return result.rows[0];
};
