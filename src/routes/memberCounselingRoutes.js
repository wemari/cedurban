const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/memberCounselingController');

// List all for one member
router.get('/:memberId', ctrl.list);

// Create a booking for member
router.post('/:memberId', ctrl.create);

// Update session (all fields)
router.put('/:memberId/:sessionId', ctrl.update);

// Delete booking + session
router.delete('/:memberId/:memberCounselingId/:sessionId', ctrl.delete);

module.exports = router;
