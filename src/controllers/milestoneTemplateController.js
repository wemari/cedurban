const model = require('../models/milestoneTemplateModel');

exports.getTemplates = async (req, res) => {
  try {
    const data = await model.getAll();
    res.json(data);
  } catch (err) {
    console.error('Error getting milestone templates:', err);
    res.status(500).json({ error: 'Failed to load templates' });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { name, required_for_promotion, description } = req.body;
    const created = await model.create(name, required_for_promotion, description);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating milestone template:', err);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, required_for_promotion, description } = req.body;
    const updated = await model.update(id, name, required_for_promotion, description);
    res.json(updated);
  } catch (err) {
    console.error('Error updating milestone template:', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await model.delete(id);
    res.json(deleted);
  } catch (err) {
    console.error('Error deleting milestone template:', err);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};
