// userRoutes.js
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Basic CRUD Routes
router.get('/', authenticate, checkPermission('view_users'), userCtrl.getAllUsers);
router.get('/:id', authenticate, checkPermission('view_users'), userCtrl.getUserById);
router.put('/:id', authenticate, checkPermission('manage_users'), userCtrl.updateUser);
router.delete('/:id', authenticate, checkPermission('manage_users'), userCtrl.deleteUser);

// Role management
router.post('/:id/roles', authenticate, checkPermission('manage_users'), userCtrl.assignRole);
router.delete('/:id/roles', authenticate, checkPermission('manage_users'), userCtrl.removeRole);

// Reset user password
router.post('/:id/reset-password', authenticate, checkPermission('manage_users'), userCtrl.resetTempPassword);

// Unlock user account
router.post('/:id/unlock', authenticate, checkPermission('manage_users'), userCtrl.unlockUser);

// Toggle active status (PATCH)
router.patch('/:id/active', authenticate, checkPermission('manage_users'), userCtrl.toggleActive);

module.exports = router;
