const db = require('../config/db');

exports.checkPermission = (permissionName) => async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT 1 FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = $1 AND p.name = $2`,
      [req.userId, permissionName]
    );

    if (result.rowCount > 0) return next();
    res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  } catch (err) {
    res.status(500).json({ message: 'Error checking permissions' });
  }
};
