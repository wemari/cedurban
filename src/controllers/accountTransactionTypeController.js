// controllers/accountTransactionTypeController.js
const ATT = require('../models/accountTransactionTypeModel');

exports.getAll = async (req, res, next) => {
  try { res.json(await ATT.findAll()); }
  catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await ATT.create(req.body)); }
  catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const updated = await ATT.update(+req.params.id, req.body);
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (err) { next(err); }
};
exports.delete = async (req, res, next) => {
  try {
    const deleted = await ATT.delete(+req.params.id);
    if (!deleted) return res.status(404).end();
    res.json(deleted);
  } catch (err) { next(err); }
};
