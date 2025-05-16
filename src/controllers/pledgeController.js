// server/controllers/pledgeController.js
const Pledge = require('../models/pledgeModel');

exports.getByMember = async (req, res, next) => {
  try {
    const data = await Pledge.findByMember(+req.params.id);
    res.json(data);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const created = await Pledge.create(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
};
