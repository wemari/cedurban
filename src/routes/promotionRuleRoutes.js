// src/routes/promotionRuleRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promotionRuleController');

router.get('/', ctrl.getRule);
router.put('/:id', ctrl.updateRule);

module.exports = router;