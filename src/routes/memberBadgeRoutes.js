// server/routes/memberBadgeRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/memberBadgeController');

router.get('/',    ctrl.list);
router.post('/',   ctrl.assign);
router.delete('/:id', ctrl.unassign);

module.exports = router;
