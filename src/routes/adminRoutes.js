const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// POST /admin/update-member-statuses
router.post('/update-member-statuses', adminController.runManualUpdate);

module.exports = router;
