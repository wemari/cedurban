// controllers/accountController.js
const Account = require('../models/accountModel');

exports.createAccount = async (req, res, next) => {
  try {
    const acc = await Account.create(req.body);
    res.status(201).json(acc);
  } catch (err) {
    next(err);
  }
};

exports.getAllAccounts = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const list = await Account.findAll(+limit || 50, +offset || 0);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.getAccountById = async (req, res, next) => {
  try {
    const a = await Account.findById(+req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    res.json(a);
  } catch (err) {
    next(err);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const upd = await Account.update(+req.params.id, req.body);
    if (!upd) return res.status(404).json({ message: 'Not found' });
    res.json(upd);
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const del = await Account.delete(+req.params.id);
    if (!del) return res.status(404).json({ message: 'Not found' });
    res.json({ id: del.id });
  } catch (err) {
    next(err);
  }
};
