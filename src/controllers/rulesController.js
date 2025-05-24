// src/controllers/rulesController.js
const rulesModel = require('../models/rulesModel');

exports.list = (req, res) => {
  rulesModel.getAllRules()
    .then(rules => res.json(rules))
    .catch(err => res.status(500).json({ error: err.message }));
};

exports.create = (req, res) => {
  rulesModel.createRule(req.body)
    .then(rule => res.status(201).json(rule))
    .catch(err => res.status(400).json({ error: err.message }));
};

exports.update = (req, res) => {
  rulesModel.updateRule(req.params.id, req.body)
    .then(rule => res.json(rule))
    .catch(err => res.status(400).json({ error: err.message }));
};

exports.delete = (req, res) => {
  rulesModel.deleteRule(req.params.id)
    .then(rule => res.json(rule))
    .catch(err => res.status(500).json({ error: err.message }));
};
