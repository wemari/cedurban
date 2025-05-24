const Role = require('../models/roleModel');

exports.createRole = async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ message: 'Error creating role' });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.getAll();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roles' });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.getById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching role' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const updated = await Role.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Role not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating role' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await Role.delete(req.params.id);
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting role' });
  }
};

exports.addPermission = async (req, res) => {
  try {
    await Role.addPermission(req.params.id, req.body.permissionId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Error adding permission' });
  }
};

exports.removePermission = async (req, res) => {
  try {
    await Role.removePermission(req.params.id, req.body.permissionId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Error removing permission' });
  }
};
