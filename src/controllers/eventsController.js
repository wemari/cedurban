const eventsModel = require('../models/eventsModel');

// ✅ Create a new event
exports.create = async (req, res) => {
  try {
    const event = await eventsModel.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
};

// ✅ List all events
exports.list = async (req, res) => {
  try {
    const events = await eventsModel.findAll();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events', error: err.message });
  }
};

// ✅ Get a single event by ID
exports.get = async (req, res) => {
  try {
    const event = await eventsModel.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching event', error: err.message });
  }
};

// ✅ Get events by member ID (attendance history)

exports.getByMemberId = async (req, res) => {
  try {
    const events = await eventsModel.findByMemberId(req.params.memberId);
    // Instead of returning 404 if empty
    // Return empty list with 200 OK
    return res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events by member ID', error: err.message });
  }
};




// ✅ Update an event
exports.update = async (req, res) => {
  try {
    const updated = await eventsModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating event', error: err.message });
  }
};

// ✅ Delete an event
exports.remove = async (req, res) => {
  try {
    await eventsModel.remove(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event', error: err.message });
  }
};

// ✅ Get upcoming events with registration status for a member
exports.getUpcomingWithRegistrationStatus = async (req, res) => {
  try {
    const events = await eventsModel.findUpcomingWithRegistrationStatus(req.params.memberId);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching upcoming events', error: err.message });
  }
};

// ✅ Register a member for an event
exports.registerForEvent = async (req, res) => {
  try {
    const { memberId, eventId } = req.body;

    // Check if registration already exists
    const existingRegistration = await eventsModel.findRegistration(memberId, eventId);
    if (existingRegistration.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event.' });
    }

    // Create a new registration
    const registration = await eventsModel.createRegistration(memberId, eventId);
    return res.status(201).json({ message: 'Registration successful', registration });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get upcoming events excluding already registered
exports.getUpcomingWithoutRegistered = async (req, res) => {
  try {
    const events = await eventsModel.findUpcomingWithoutRegistered(req.params.memberId);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching upcoming events', error: err.message });
  }
};
