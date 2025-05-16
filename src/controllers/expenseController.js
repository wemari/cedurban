// controllers/expenseController.js
const Expense = require('../models/expenseModel');

exports.createExpense = async (req, res, next) => {
  try {
    const exp = await Expense.create(req.body);
    res.status(201).json(exp);
  } catch (err) {
    next(err);
  }
};

exports.getAllExpenses = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const list = await Expense.findAll(+limit || 50, +offset || 0);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.getExpenseById = async (req, res, next) => {
  try {
    const item = await Expense.findById(+req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const upd = await Expense.update(+req.params.id, req.body);
    if (!upd) return res.status(404).json({ message: 'Not found' });
    res.json(upd);
  } catch (err) {
    next(err);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const del = await Expense.delete(+req.params.id);
    if (!del) return res.status(404).json({ message: 'Not found' });
    res.json({ id: del.id });
  } catch (err) {
    next(err);
  }
};
