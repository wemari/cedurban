// src/controllers/designationsController.js
const desigModel = require('../models/designationModel');

exports.list = (req, res) => {
  desigModel.getAll()
    .then(list => res.json(list))
    .catch(err => res.status(500).json({ error: err.message }));
};

exports.create = (req, res) => {
  desigModel.create(req.body)
    .then(item => res.status(201).json(item))
    .catch(err => res.status(400).json({ error: err.message }));
};

exports.update = (req, res) => {
  desigModel.update(req.params.id, req.body)
    .then(item => res.json(item))
    .catch(err => res.status(400).json({ error: err.message }));
};

exports.delete = (req, res) => {
  desigModel.delete(req.params.id)
    .then(item => res.json(item))
    .catch(err => res.status(500).json({ error: err.message }));
};