
const attendanceModel = require('../models/attendanceModel');
const db = require('../config/db');

const recordAttendance = async (req, res, method) => {
    try {
        const { member_id, event_id, metadata, proof_url } = req.body;
        const result = await attendanceModel.create({
            member_id,
            event_id,
            method,
            metadata,
            proof_url
        });
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Failed to record attendance', error: err.message });
    }
};

exports.manual = (req, res) => recordAttendance(req, res, 'manual');
exports.qr = async (req, res) => {
    const { member_id, event_id, qr_token } = req.body;
    const event = await db.query(`SELECT qr_token FROM events WHERE id = $1`, [event_id]);
    if (!event.rows.length || event.rows[0].qr_token !== qr_token)
        return res.status(403).json({ message: 'Invalid QR token' });
    recordAttendance(req, res, 'qr');
};
exports.geofence = async (req, res) => {
    const { member_id, event_id, metadata } = req.body;
    const event = await db.query(`SELECT latitude, longitude, geofence_radius FROM events WHERE id = $1`, [event_id]);
    if (!event.rows.length) return res.status(404).json({ message: 'Event not found' });
    const { latitude, longitude, geofence_radius } = event.rows[0];
    const dist = getDistance(latitude, longitude, metadata.lat, metadata.lng);
    if (dist > geofence_radius) return res.status(403).json({ message: 'Outside geofence' });
    recordAttendance(req, res, 'geofence');
};
exports.push = (req, res) => recordAttendance(req, res, 'push');
exports.rfid = async (req, res) => {
    const { rfid_tag, event_id } = req.body;
    const member = await db.query(`SELECT id FROM members WHERE rfid_tag = $1`, [rfid_tag]);
    if (!member.rows.length) return res.status(404).json({ message: 'RFID not recognized' });
    req.body.member_id = member.rows[0].id;
    recordAttendance(req, res, 'rfid');
};
exports.beacon = async (req, res) => {
    const { beacon_id, event_id, member_id } = req.body;
    const beacon = await db.query(`SELECT * FROM beacons WHERE beacon_id = $1 AND event_id = $2`, [beacon_id, event_id]);
    if (!beacon.rows.length) return res.status(403).json({ message: 'Invalid beacon for this event' });
    req.body.metadata = { beacon_id };
    recordAttendance(req, res, 'beacon');
};
exports.code = async (req, res) => {
    const { code, event_id, member_id } = req.body;
    const event = await db.query(`SELECT qr_token FROM events WHERE id = $1`, [event_id]);
    if (!event.rows.length || event.rows[0].qr_token !== code)
        return res.status(403).json({ message: 'Invalid code' });
    recordAttendance(req, res, 'code');
};

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in meters
}
// at the bottom of src/controllers/attendanceController.js

// wrap your existing model finders in HTTP handlers:
exports.getByEvent = async (req, res) => {
  try {
    const list = await attendanceModel.findByEvent(req.params.eventId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event attendance', error: err.message });
  }
};

exports.getByMember = async (req, res) => {
  try {
    const list = await attendanceModel.findByMember(req.params.memberId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch member attendance', error: err.message });
  }
};

// OPTIONAL: if you want update & delete endpoints:
// UPDATE an attendance record
exports.updateAttendance = async (req, res) => {
  try {
    // implement as you need—e.g. attendanceModel.update(req.params.id, req.body)
    const updated = await attendanceModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update attendance', error: err.message });
  }
};

// DELETE an attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    await attendanceModel.remove(req.params.id);
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete attendance', error: err.message });
  }
};
