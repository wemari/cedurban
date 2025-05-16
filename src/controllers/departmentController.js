// src/controllers/departmentController.js

const model = require('../models/departmentModel');

exports.createDepartment = async (req, res) => {
  try {
    const item = await model.createDepartment(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error creating department' });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const list = await model.getAllDepartments();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving departments' });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const item = await model.getDepartmentById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving department' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const item = await model.updateDepartment(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error updating department' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const item = await model.deleteDepartment(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting department' });
  }
};

exports.getDepartmentsWithMembers = async (req, res) => {
  try {
    const list = await model.getDepartmentsWithMembers();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error loading departments with members' });
  }
};

exports.getDepartmentMembers = async (req, res) => {
  try {
    const allDepts = await model.getDepartmentsWithMembers();
    const dept = allDepts.find(d => d.id === parseInt(req.params.id));
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json({ members: dept.members });
  } catch (err) {
    console.error('Error getting department members:', err);
    res.status(500).json({ error: 'Failed to fetch department members' });
  }
};