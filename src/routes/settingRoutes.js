// routes/settingRoutes.js
const express = require('express');
const ctrl    = require('../controllers/settingController');
const router  = express.Router();

router.get('/base-currency', ctrl.getBaseCurrency);
router.put('/base-currency', ctrl.setBaseCurrency);

module.exports = router;
