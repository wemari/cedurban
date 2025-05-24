// controllers/settingController.js
const Setting = require('../models/settingModel');

exports.getBaseCurrency = async (req, res, next) => {
  try {
    const value = await Setting.get('base_currency');
    res.json({ base_currency: value });
  } catch (err) {
    next(err);
  }
};

exports.setBaseCurrency = async (req, res, next) => {
  const { base_currency } = req.body;
  if (!/^[A-Z]{3}$/.test(base_currency)) {
    return res.status(400).json({ message: 'Invalid currency code' });
  }
  try {
    const setting = await Setting.set('base_currency', base_currency);
    res.json(setting);
  } catch (err) {
    next(err);
  }
};

exports.getTables = async (req, res, next) => {
  try {
    const tables = await Setting.listTables();
    res.json(tables);
  } catch (err) {
    next(err);
  }
};

exports.getColumnsForTable = async (req, res, next) => {
  try {
    const tableName = req.params.table;
    const cols      = await Setting.listColumnsForTable(tableName);
    res.json(cols);
  } catch (err) {
    next(err);
  }
};