const express = require('express');
const router = express.Router();
const controller = require('../controllers/milestoneRecordController');

// 👉 Add this route to support GET /api/milestones
router.get('/', controller.getAll);

router.get('/:member_id', controller.getByMember);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

module.exports = router;
