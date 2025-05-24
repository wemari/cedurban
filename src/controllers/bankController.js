// controllers/bankController.js
const Bank = require('../models/bankModel');

exports.getAll = async (req, res, next) => {
  try { res.json(await Bank.findAll()); }
  catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await Bank.create(req.body)); }
  catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const b = await Bank.update(+req.params.id, req.body);
    if (!b) return res.status(404).end();
    res.json(b);
  } catch (err) { next(err); }
};
exports.delete = async (req, res, next) => {
  try {
    const d = await Bank.delete(+req.params.id);
    if (!d) return res.status(404).end();
    res.json(d);
  } catch (err) { next(err); }
};
