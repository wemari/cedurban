// src/helpers/groupMembershipHelper.js

const db = require('../config/db');
const { splitCellGroup } = require('../services/splitService');

/**
 * Evaluates a group against rules and triggers splitting if needed.
 */
exports.evaluateGroupForSplit = async (cellGroupId) => {
  const { rowCount: size } = await db.query(
    'SELECT 1 FROM member_cell_group WHERE cell_group_id = $1',
    [cellGroupId]
  );

  const ruleRes = await db.query(
    'SELECT * FROM cell_group_rules WHERE $1 BETWEEN min_size AND max_size LIMIT 1;',
    [size]
  );

  const rule = ruleRes.rows[0];
  if (!rule) return;

  if (rule.split_into > 1) {
    await splitCellGroup(cellGroupId, rule.split_into);
  }
};
