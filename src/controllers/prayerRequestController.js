const model = require('../models/prayerRequestModel');

exports.create = async (req, res) => {
  try {
    const item = await model.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating prayer request' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const items = await model.getAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching prayer requests' });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await model.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving prayer request' });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await model.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error updating prayer request' });
  }
};

exports.delete = async (req, res) => {
  try {
    const item = await model.delete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting prayer request' });
  }
};
