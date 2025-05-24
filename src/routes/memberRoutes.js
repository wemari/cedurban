// src/routes/memberRoutes.js

const express           = require('express');
const router            = express.Router();
const uploadPhoto       = require('../middleware/upload');      // your existing photo uploader
const uploadCsv         = require('../middleware/uploadCsv');   // the CSV uploader you added
const memberController  = require('../controllers/memberController');


// ── Bulk Import / Export ────────────────────────────────────────────────
// Export all members as CSV
router.get('/export', memberController.exportMembers);
// Import members from CSV (field name: "file", plus a JSON "columns" body field)
router.post('/import', uploadCsv, memberController.importMembers);

// ── Standard CRUD & Utilities ────────────────────────────────────────────
// Create member (with optional profile_photo)
router.post('/', uploadPhoto.single('profile_photo'), memberController.createMember);
// List / filter members
router.get('/', memberController.getAllMembers);
// Check duplicate field/value
router.get('/check-duplicate', memberController.checkDuplicate);
// Get single member by ID
router.get('/:id', memberController.getById);
// Update member (with optional new profile_photo)
router.put('/:id', uploadPhoto.single('profile_photo'), memberController.updateMember);
// Delete member
router.delete('/:id', memberController.deleteMember);

// ── Finance & Gamification Endpoints ────────────────────────────────────
// Summary stats (total given, count, average, pledge %)
router.get('/:id/stats',           memberController.getStats);
// Giving activity heatmap data
router.get('/:id/heatmap',         memberController.getHeatmap);
// Monthly giving totals
router.get('/:id/monthly-giving',  memberController.getMonthlyGiving);
// Earned badges list
router.get('/:id/badges',          memberController.getBadges);

module.exports = router;
