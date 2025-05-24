const ImportColumn = require('../models/importColumnModel');
const { Parser } = require('json2csv'); // Make sure you have this package
const importColumnModel = require('../models/importColumnModel');

exports.getAll = async (req, res, next) => {
  try {
    const rows = await ImportColumn.getAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const row = await ImportColumn.getById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const newRow = await ImportColumn.create(req.body);
    res.status(201).json(newRow);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await ImportColumn.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await ImportColumn.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.downloadTemplate = async (req, res) => {
  const tableName = req.params.table;

  try {
    const columns = await ImportColumn.getRequiredByTable(tableName);

    if (!columns.length) {
      return res.status(404).json({ message: 'No required columns found for this table.' });
    }

    // Use the label if present, otherwise fallback to column_name
    const headers = columns.map(col => col.label || col.column_name);
    const csv = headers.join(',') + '\n';

    res.header('Content-Type', 'text/csv');
    res.attachment(`${tableName}_template.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Download Template Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};