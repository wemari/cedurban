// controllers/incomeController.js
const Income = require('../models/incomeModel');

exports.createIncome = async (req, res, next) => {
  try {
    const newIncome = await Income.create(req.body);
    res.status(201).json(newIncome);
  } catch (err) {
    next(err);
  }
};

exports.getAllIncome = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const incomes = await Income.findAll(+limit || 50, +offset || 0);
    res.json(incomes);
  } catch (err) {
    next(err);
  }
};

exports.getIncomeById = async (req, res, next) => {
  try {
    const income = await Income.findById(+req.params.id);
    if (!income) return res.status(404).json({ message: 'Not found' });
    res.json(income);
  } catch (err) {
    next(err);
  }
};

exports.updateIncome = async (req, res, next) => {
  try {
    const updated = await Income.update(+req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteIncome = async (req, res, next) => {
  try {
    const deleted = await Income.delete(+req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ id: deleted.id });
  } catch (err) {
    next(err);
  }
};
