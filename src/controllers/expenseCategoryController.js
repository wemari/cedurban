// controllers/expenseCategoryController.js
const ExpenseCategory = require('../models/expenseCategoryModel');

exports.getAll = async (req, res, next) => {
  try { res.json(await ExpenseCategory.findAll()); }
  catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json(await ExpenseCategory.create(req.body)); }
  catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await ExpenseCategory.update(+req.params.id, req.body);
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const deleted = await ExpenseCategory.delete(+req.params.id);
    if (!deleted) return res.status(404).end();
    res.json(deleted);
  } catch (err) { next(err); }
};
