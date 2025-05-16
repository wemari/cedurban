// server/routes/pledgeRoutes.js
const express = require('express');
const ctrl    = require('../controllers/pledgeController');
const router  = express.Router();

router.get('/members/:id/pledges', ctrl.getByMember);
router.post('/pledges',            ctrl.create);

module.exports = router;
