const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/memberPrayerRequestController');

router.get('/:memberId', ctrl.list);
router.post('/:memberId', ctrl.create);
router.put('/:memberId/:id', ctrl.update);
router.delete('/:memberId/:id', ctrl.delete);

module.exports = router;
