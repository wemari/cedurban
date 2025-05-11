const router = require('express').Router();
const roleCtrl = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

router.post('/', authenticate, checkPermission('manage_roles'), roleCtrl.createRole);
router.get('/', authenticate, checkPermission('view_roles'), roleCtrl.getAllRoles);
router.get('/:id', authenticate, checkPermission('view_roles'), roleCtrl.getRoleById);
router.put('/:id', authenticate, checkPermission('manage_roles'), roleCtrl.updateRole);
router.delete('/:id', authenticate, checkPermission('manage_roles'), roleCtrl.deleteRole);

router.post('/:id/permissions', authenticate, checkPermission('manage_roles'), roleCtrl.addPermission);
router.delete('/:id/permissions', authenticate, checkPermission('manage_roles'), roleCtrl.removePermission);

module.exports = router;
