// src/models/cellGroupModel.js

const db = require('../config/db');

// Create Cell Group
exports.createCellGroup = async (data) => {
  const { name, address, leader_id } = data;
  const result = await db.query(`
    INSERT INTO cell_groups (name, address, leader_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `, [name, address, leader_id]);
  return result.rows[0];
};

// Get All Cell Groups
exports.getAllCellGroups = async () => {
  const result = await db.query('SELECT * FROM cell_groups ORDER BY id DESC');
  return result.rows;
};

// Get Cell Group by ID
exports.getCellGroupById = async (id) => {
  const result = await db.query('SELECT * FROM cell_groups WHERE id = $1', [id]);
  return result.rows[0];
};

// Update Cell Group
exports.updateCellGroup = async (id, data) => {
  const { name, address, leader_id } = data;
  const result = await db.query(`
    UPDATE cell_groups
    SET name = $1, address = $2, leader_id = $3
    WHERE id = $4
    RETURNING *;
  `, [name, address, leader_id, id]);
  return result.rows[0];
};

// Delete Cell Group
exports.deleteCellGroup = async (id) => {
  const result = await db.query('DELETE FROM cell_groups WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};



exports.getAll = async () => {
  const result = await db.query(`
    SELECT 
      cg.id, 
      cg.name, 
      cg.address, 
      cg.leader_id,
      COALESCE(
        json_agg(
          jsonb_build_object(
            'membership_id', mcg.id,
            'member_id', m.id,
            'first_name', m.first_name,
            'surname', m.surname,
            'email', m.email,
            'contact_primary', m.contact_primary,
            'designation', mcg.designation,
            'date_joined', TO_CHAR(mcg.date_joined, 'YYYY-MM-DD')
          )
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS members
    FROM cell_groups cg
    LEFT JOIN member_cell_group mcg ON mcg.cell_group_id = cg.id
    LEFT JOIN members m ON m.id = mcg.member_id
    GROUP BY cg.id
    ORDER BY cg.name ASC;
  `);

  return result.rows;
};
