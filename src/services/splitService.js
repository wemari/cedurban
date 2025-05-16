// src/services/splitService.js

const db = require('../config/db');
const {
  createCellGroup,
  deleteCellGroup
} = require('../models/cellGroupModel');
const promoModel = require('../models/promotionRuleModel');

/**
 * Splits a cell group into N new groups based on the rule.
 */
async function splitCellGroup(oldGroupId, splitInto) {
  // Lazy require to avoid circular dependency
  const {
    getMembershipsByCellGroupId,
    updateMembership
  } = require('../models/memberCellGroupModel');

  const members = await getMembershipsByCellGroupId(oldGroupId);
  if (!members.length) return;

  const perGroup = Math.ceil(members.length / splitInto);

  const { rows } = await db.query(
    'SELECT name, address, leader_id FROM cell_groups WHERE id = $1',
    [oldGroupId]
  );
  const { name: oldName, address, leader_id } = rows[0];

  const newGroupIds = [];
  for (let i = 1; i <= splitInto; i++) {
    const name = `${oldName} - Part ${i}`;
    const newGroup = await createCellGroup({ name, address, leader_id, parent_group_id: oldGroupId });
    newGroupIds.push(newGroup.id);
  }

  for (let idx = 0; idx < members.length; idx++) {
    const membership = members[idx];
    const targetGroupId = newGroupIds[Math.floor(idx / perGroup)];
    await updateMembership(membership.id, { cell_group_id: targetGroupId });
  }

  await deleteCellGroup(oldGroupId);

  console.log(`Split group ${oldGroupId} into ${splitInto} parts: ${newGroupIds.join(', ')}`);

  // Promotion logic
  const rule = await promoModel.getPromotionRule();
  if (!rule) return;

  const siblingsRes = await db.query(
    `SELECT cg.id
     FROM cell_groups cg
     LEFT JOIN member_cell_group mcg ON mcg.cell_group_id = cg.id
     WHERE cg.parent_group_id = $1
     GROUP BY cg.id
     HAVING COUNT(mcg.id) <= $2`,
    [oldGroupId, rule.max_members_per_group]
  );

  if (siblingsRes.rows.length >= rule.child_count_required) {
    const promotableGroups = siblingsRes.rows.slice(0, rule.child_count_required);

    for (const row of promotableGroups) {
      await db.query(
        `UPDATE cell_groups
         SET designation = $1, promoted_at = NOW()
         WHERE id = $2`,
        [rule.designation_name, row.id]
      );
    }

    console.log(`Promoted ${promotableGroups.length} sibling groups to ${rule.designation_name}`);
  }
}

exports.splitCellGroup = splitCellGroup;
