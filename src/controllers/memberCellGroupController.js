// src/controllers/memberCellGroupController.js
const model = require('../models/memberCellGroupModel');
const splitService = require('../services/splitService');
const { sendNotification } = require('../services/notificationService');

exports.createMembership = async (req, res) => {
  try {
    const item = await model.createMembership(req.body);
    res.status(201).json(item);

    // re-evaluate for split after adding a member
    await splitService.evaluateGroupForSplit(req.body.cell_group_id);

    // Notify the member of the new assignment
    sendNotification(
      req.body.member_id,
      'Cell Group Membership',
      'You have been added to a new cell group.'
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating membership' });
  }
};

exports.deleteMembership = async (req, res) => {
  try {
    // fetch before deletion to know group id
    const membership = await model.getMembershipById(req.params.id);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    await model.deleteMembership(req.params.id);
    res.json({ message: 'Member removed.' });

    // re-evaluate for split after removing a member
    await splitService.evaluateGroupForSplit(membership.cell_group_id);

    // Notify the member about removal
    sendNotification(
      membership.member_id,
      'Cell Group Membership Removed',
      'You have been removed from a cell group.'
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing membership' });
  }
};

exports.getMembershipsByCellGroupId = (req, res) => {
  model.getMembershipsByCellGroupId(req.params.cellGroupId)
    .then(list => res.json(list))
    .catch(err => res.status(500).json({ message: 'Error fetching members' }));
};

exports.getMembershipsByMemberId = (req, res) => {
  model.getMembershipsByMemberId(req.params.memberId)
    .then(list => res.json(list))
    .catch(err => res.status(500).json({ message: 'Error fetching cell groups for member' }));
};

exports.updateMembership = async (req, res) => {
  try {
    const updated = await model.updateMembership(req.params.id, req.body);
    res.json(updated);
    await splitService.evaluateGroupForSplit(updated.cell_group_id);
    sendNotification(
      updated.member_id,
      'Cell Group Membership Updated',
      'Your cell group assignment details have been updated.'
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating membership' });
  }
};
exports.getAllMemberships = async (req, res) => {
  try {
    const all = await model.getAllMemberships();
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all memberships' });
  }
};