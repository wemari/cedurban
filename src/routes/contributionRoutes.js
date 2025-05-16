// server/routes/contributionRoutes.js
const express = require('express');
const ctrl    = require('../controllers/contributionController');
const router  = express.Router();

router.get('/members/:id/contributions', ctrl.getByMember);
router.post('/contributions/:id/proof',  ctrl.uploadProof);
router.post('/contributions/pay',        ctrl.makePayment);

module.exports = router;
