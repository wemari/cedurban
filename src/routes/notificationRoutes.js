const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

router.get('/:memberId', controller.getMemberNotifications);
router.patch('/read/:id', controller.markAsRead);
router.patch('/read-all/:memberId', controller.markAllAsRead);
router.post('/', controller.createNotification);





module.exports = router;
