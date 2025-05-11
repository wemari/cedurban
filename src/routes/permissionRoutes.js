const router = require('express').Router();
const permissionCtrl = require('../controllers/permissionController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

router.post('/', authenticate, checkPermission('manage_permissions'), permissionCtrl.createPermission);
router.get('/', authenticate, checkPermission('view_permissions'), permissionCtrl.getAllPermissions);
router.get('/:id', authenticate, checkPermission('view_permissions'), permissionCtrl.getPermissionById);
router.put('/:id', authenticate, checkPermission('manage_permissions'), permissionCtrl.updatePermission);
router.delete('/:id', authenticate, checkPermission('manage_permissions'), permissionCtrl.deletePermission);

module.exports = router;
