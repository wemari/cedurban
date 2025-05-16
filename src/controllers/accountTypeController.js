// controllers/accountTypeController.js
const AccountType = require('../models/accountTypeModel');

exports.getAll = async (req, res, next) => {
  try { res.json(await AccountType.findAll()); }
  catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json(await AccountType.create(req.body)); }
  catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await AccountType.update(+req.params.id, req.body);
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const deleted = await AccountType.delete(+req.params.id);
    if (!deleted) return res.status(404).end();
    res.json(deleted);
  } catch (err) { next(err); }
};
