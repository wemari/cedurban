const Permission = require('../models/permissionModel');

exports.createPermission = async (req, res) => {
  try {
    const permission = await Permission.create(req.body);
    res.status(201).json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Error creating permission' });
  }
};

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.getAll();
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching permissions' });
  }
};

exports.getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.getById(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });
    res.json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching permission' });
  }
};

exports.updatePermission = async (req, res) => {
  try {
    const updated = await Permission.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Permission not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating permission' });
  }
};

exports.deletePermission = async (req, res) => {
  try {
    await Permission.delete(req.params.id);
    res.json({ message: 'Permission deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting permission' });
  }
};
