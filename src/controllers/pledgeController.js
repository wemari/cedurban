// server/controllers/pledgeController.js
const model = require('../models/pledgeModel');

exports.listPledges = async (req, res) => {
  try {
    const list = await model.list();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving pledges' });
  }
};

exports.getPledge = async (req, res) => {
  try {
    const p = await model.get(+req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving pledge' });
  }
};

exports.createPledge = async (req, res) => {
  try {
    const p = await model.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ message: 'Error creating pledge' });
  }
};

exports.updatePledge = async (req, res) => {
  try {
    const p = await model.update(+req.params.id, req.body);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: 'Error updating pledge' });
  }
};

exports.deletePledge = async (req, res) => {
  try {
    const p = await model.delete(+req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting pledge' });
  }
};
