// controllers/accountTransactionController.js
const AccountTransaction = require('../models/accountTransactionModel');

exports.createTxn = async (req, res, next) => {
  try {
    const txn = await AccountTransaction.create(req.body);
    res.status(201).json(txn);
  } catch (err) {
    next(err);
  }
};

exports.getAllTxns = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const list = await AccountTransaction.findAll(+limit||50, +offset||0);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.getTxnById = async (req, res, next) => {
  try {
    const txn = await AccountTransaction.findById(+req.params.id);
    if (!txn) return res.status(404).json({ message: 'Not found' });
    res.json(txn);
  } catch (err) {
    next(err);
  }
};

exports.updateTxn = async (req, res, next) => {
  try {
    const upd = await AccountTransaction.update(+req.params.id, req.body);
    if (!upd) return res.status(404).json({ message: 'Not found' });
    res.json(upd);
  } catch (err) {
    next(err);
  }
};

exports.deleteTxn = async (req, res, next) => {
  try {
    const del = await AccountTransaction.delete(+req.params.id);
    if (!del) return res.status(404).json({ message: 'Not found' });
    res.json({ id: del.id });
  } catch (err) {
    next(err);
  }
};
