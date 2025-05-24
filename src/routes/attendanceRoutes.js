const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/attendanceController');

// Specific check-in methods
router.post('/manual',   ctrl.manual);
router.post('/qr',       ctrl.qr);
router.post('/geofence', ctrl.geofence);
router.post('/push',     ctrl.push);
router.post('/rfid',     ctrl.rfid);
router.post('/beacon',   ctrl.beacon);
router.post('/code',     ctrl.code);

// Fetch attendance history
router.get('/event/:eventId',  ctrl.getByEvent);
router.get('/member/:memberId',ctrl.getByMember);

// (Optional) edit/delete endpoints if you need them
router.put('/:id',    ctrl.updateAttendance);
router.delete('/:id', ctrl.deleteAttendance);

module.exports = router;
