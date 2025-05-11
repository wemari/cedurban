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

module.exports = router;
