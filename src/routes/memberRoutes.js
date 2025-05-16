const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const memberController = require('../controllers/memberController');

router.post('/', upload.single('profile_photo'), memberController.createMember);
router.get('/', memberController.getAllMembers);
router.get('/check-duplicate', memberController.checkDuplicate); // NEW
router.get('/:id', memberController.getMemberById);
router.put('/:id', upload.single('profile_photo'), memberController.updateMember);
router.delete('/:id', memberController.deleteMember);


// ── Finance & Gamification Endpoints ─────────────────────────────────────────
// GET summary stats
router.get('/:id/stats', memberController.getStats);
// GET giving heatmap data
router.get('/:id/heatmap', memberController.getHeatmap);
// GET monthly giving totals
router.get('/:id/monthly-giving', memberController.getMonthlyGiving);
// GET earned badges
router.get('/:id/badges', memberController.getBadges);
module.exports = router;
