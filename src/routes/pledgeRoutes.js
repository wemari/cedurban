// server/routes/pledgeRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/pledgeController');

router.get('/',    ctrl.listPledges);
router.get('/:id', ctrl.getPledge);
router.post('/',   ctrl.createPledge);
router.put('/:id', ctrl.updatePledge);
router.delete('/:id', ctrl.deletePledge);

module.exports = router;
