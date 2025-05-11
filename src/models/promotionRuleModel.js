// src/models/promotionRuleModel.js
const db = require('../config/db');

exports.getPromotionRule = async () => {
  const res = await db.query('SELECT * FROM cell_group_promotion_rules LIMIT 1');
  return res.rows[0];
};

exports.updatePromotionRule = async (id, data) => {
  const res = await db.query(
    `UPDATE cell_group_promotion_rules
     SET child_count_required = $1,
         max_members_per_group = $2,
         designation_name = $3
     WHERE id = $4 RETURNING *;`,
    [data.child_count_required, data.max_members_per_group, data.designation_name, id]
  );
  return res.rows[0];
};