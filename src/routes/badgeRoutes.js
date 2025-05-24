// server/routes/badgeRoutes.js
const express = require('express');
const router = express.Router();
const ctrl   = require('../controllers/badgeController');

router.get('/',    ctrl.listBadges);
router.get('/:id', ctrl.getBadge);
router.post('/',   ctrl.createBadge);
router.put('/:id', ctrl.updateBadge);
router.delete('/:id', ctrl.deleteBadge);

module.exports = router;
