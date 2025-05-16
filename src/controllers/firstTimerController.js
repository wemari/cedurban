const FirstTimer = require('../models/firstTimerModel');

exports.getAllFirstTimers = async (req, res) => {
  try {
    const data = await FirstTimer.getAll();
    res.json(data);
  } catch (err) {
    console.error('Error fetching first timers:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createFirstTimer = async (req, res) => {
  try {
    const firstTimer = await FirstTimer.create(req.body);
    res.status(201).json(firstTimer);
  } catch (err) {
    console.error('Error creating first timer:', err);
    res.status(500).json({ error: 'Failed to create first timer' });
  }
};

exports.updateFirstTimer = async (req, res) => {
  try {
    const updated = await FirstTimer.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating first timer:', err);
    res.status(500).json({ error: 'Failed to update first timer' });
  }
};

exports.deleteFirstTimer = async (req, res) => {
  try {
    const deleted = await FirstTimer.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', deleted });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
