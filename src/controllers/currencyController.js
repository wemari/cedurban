// controllers/currencyController.js
const Currency = require('../models/currencyModel');

exports.getAll = async (req, res, next) => {
  try { res.json(await Currency.findAll()); }
  catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await Currency.create(req.body)); }
  catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const c = await Currency.update(+req.params.id, req.body);
    if (!c) return res.status(404).end();
    res.json(c);
  } catch (err) { next(err); }
};
exports.delete = async (req, res, next) => {
  try {
    const d = await Currency.delete(+req.params.id);
    if (!d) return res.status(404).end();
    res.json(d);
  } catch (err) { next(err); }
};
