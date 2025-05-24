// server/controllers/badgeController.js
const model = require('../models/badgeModel');

exports.listBadges = async (req, res) => {
  try {
    const list = await model.list();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving badges' });
  }
};

exports.getBadge = async (req, res) => {
  try {
    const b = await model.get(+req.params.id);
    if (!b) return res.status(404).json({ message: 'Not found' });
    res.json(b);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving badge' });
  }
};

exports.createBadge = async (req, res) => {
  try {
    const b = await model.create(req.body);
    res.status(201).json(b);
  } catch (err) {
    res.status(500).json({ message: 'Error creating badge' });
  }
};

exports.updateBadge = async (req, res) => {
  try {
    const b = await model.update(+req.params.id, req.body);
    if (!b) return res.status(404).json({ message: 'Not found' });
    res.json(b);
  } catch (err) {
    res.status(500).json({ message: 'Error updating badge' });
  }
};

exports.deleteBadge = async (req, res) => {
  try {
    const b = await model.delete(+req.params.id);
    if (!b) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting badge' });
  }
};
