// controllers/budgetController.js
const Budget = require('../models/budgetModel');

exports.createBudget = async (req, res, next) => {
  try {
    const b = await Budget.create(req.body);
    res.status(201).json(b);
  } catch (err) {
    next(err);
  }
};

exports.getAllBudgets = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const list = await Budget.findAll(+limit||50, +offset||0);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.getBudgetById = async (req, res, next) => {
  try {
    const b = await Budget.findById(+req.params.id);
    if (!b) return res.status(404).json({ message: 'Not found' });
    res.json(b);
  } catch (err) {
    next(err);
  }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const upd = await Budget.update(+req.params.id, req.body);
    if (!upd) return res.status(404).json({ message: 'Not found' });
    res.json(upd);
  } catch (err) {
    next(err);
  }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const del = await Budget.delete(+req.params.id);
    if (!del) return res.status(404).json({ message: 'Not found' });
    res.json({ id: del.id });
  } catch (err) {
    next(err);
  }
};
