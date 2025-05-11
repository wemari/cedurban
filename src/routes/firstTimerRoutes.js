const express = require('express');
const router = express.Router();
const controller = require('../controllers/firstTimerController');

// Get all first timers
router.get('/', controller.getAllFirstTimers);

// Create a first timer
router.post('/', controller.createFirstTimer);

// Update a first timer
router.put('/:id', controller.updateFirstTimer);

// Delete a first timer
router.delete('/:id', controller.deleteFirstTimer);

module.exports = router;
