const NewConvert = require('../models/newConvertModel');

// Get all new converts
exports.getAllNewConverts = async (req, res) => {
  try {
    const data = await NewConvert.getAll();
    res.json(data);
  } catch (err) {
    console.error('Error fetching new converts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create
exports.createNewConvert = async (req, res) => {
  try {
    const convert = await NewConvert.create(req.body);
    res.status(201).json(convert);
  } catch (err) {
    console.error('Error creating new convert:', err);
    res.status(500).json({ error: 'Failed to create new convert' });
  }
};

// Update
exports.updateNewConvert = async (req, res) => {
  try {
    const updated = await NewConvert.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'New convert not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating new convert:', err);
    res.status(500).json({ error: 'Failed to update new convert' });
  }
};

// Delete
exports.deleteNewConvert = async (req, res) => {
  try {
    const deleted = await NewConvert.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'New convert not found' });
    res.json({ message: 'New convert deleted' });
  } catch (err) {
    console.error('Error deleting new convert:', err);
    res.status(500).json({ error: 'Failed to delete new convert' });
  }
};
