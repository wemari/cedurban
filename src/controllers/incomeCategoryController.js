// controllers/incomeCategoryController.js
const IncomeCategory = require('../models/incomeCategoryModel');

exports.getAll = async (req, res, next) => {
  try {
    const list = await IncomeCategory.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const cat = await IncomeCategory.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const cat = await IncomeCategory.update(+req.params.id, req.body);
    if (!cat) return res.status(404).end();
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const cat = await IncomeCategory.delete(+req.params.id);
    if (!cat) return res.status(404).end();
    res.json(cat);
  } catch (err) {
    next(err);
  }
};
