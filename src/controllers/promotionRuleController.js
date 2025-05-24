// src/controllers/promotionRuleController.js
const promoModel = require('../models/promotionRuleModel');

exports.getRule = async (req, res) => {
  try {
    const rule = await promoModel.getPromotionRule();
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const rule = await promoModel.updatePromotionRule(req.params.id, req.body);
    res.json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};