// server/controllers/memberBadgeController.js
const model = require('../models/memberBadgeModel');

exports.list = async (req, res) => {
  try {
    const list = await model.list();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving assignments' });
  }
};

exports.assign = async (req, res) => {
  try {
    const rec = await model.assign(req.body);
    res.status(201).json(rec);
  } catch (err) {
    res.status(500).json({ message: 'Error assigning badge' });
  }
};

exports.unassign = async (req, res) => {
  try {
    const cnt = await model.unassign(+req.params.id);
    if (!cnt) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Error unassigning badge' });
  }
};
