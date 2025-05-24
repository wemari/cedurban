// src/controllers/cellGroupController.js

const cellGroupModel = require('../models/cellGroupModel');

// Create Cell Group
exports.createCellGroup = async (req, res) => {
  try {
    const group = await cellGroupModel.createCellGroup(req.body);
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating cell group' });
  }
};

// Get All
exports.getAllCellGroups = async (req, res) => {
  try {
    const list = await cellGroupModel.getAll(); // <-- use the version that includes members
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving cell groups' });
  }
};


// Get Single
exports.getCellGroupById = async (req, res) => {
  try {
    const group = await cellGroupModel.getCellGroupById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Cell group not found' });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving cell group' });
  }
};

// Update
exports.updateCellGroup = async (req, res) => {
  try {
    const updated = await cellGroupModel.updateCellGroup(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Cell group not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating cell group' });
  }
};

// Delete
exports.deleteCellGroup = async (req, res) => {
  try {
    const deleted = await cellGroupModel.deleteCellGroup(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Cell group not found' });
    res.json({ message: 'Cell group deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting cell group' });
  }
};

exports.getCellGroupMembers = async (req, res) => {
  try {
    const allGroups = await cellGroupModel.getAll(); // This includes members
    const group = allGroups.find(g => g.id === parseInt(req.params.id));
    if (!group) return res.status(404).json({ error: 'Cell group not found' });
    res.json({ members: group.members });
  } catch (err) {
    console.error('Error getting cell group members:', err);
    res.status(500).json({ error: 'Failed to fetch members for cell group' });
  }
};
