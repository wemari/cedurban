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
