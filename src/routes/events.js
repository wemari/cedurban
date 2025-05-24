const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventsController');

// Create a new event
router.post('/', eventController.create);

// Get all events
router.get('/', eventController.list);

// Get a single event by ID
router.get('/:id', eventController.get);

// Get events by member ID (attendance history)
router.get('/member/:memberId', eventController.getByMemberId);

// Get upcoming events with registration status for a member
router.get('/member/:memberId/upcoming', eventController.getUpcomingWithoutRegistered);

// Update an event by ID
router.put('/:id', eventController.update);

// Delete an event by ID
router.delete('/:id', eventController.remove);

// Register a member for an event
router.post('/register', eventController.registerForEvent);

module.exports = router;
