const Counseling = require('../models/counselingModel');

exports.list = async (req, res, next) => {
  try {
    const result = await Counseling.getAllSessions();
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await Counseling.getSessionById(id);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const session = req.body;
    const newSession = await Counseling.createSession(session);
    res.status(201).json(newSession.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const session = req.body;
    const updated = await Counseling.updateSession(id, session);
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await Counseling.deleteSession(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
