const bcrypt = require('bcryptjs');
const db = require('../config/db');
const User = require('../models/userModel');
const { sendNotification } = require('../services/notificationService');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updated = await User.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);

    // Notify user
    console.log(`▶️ [Notification] Notifying user ${req.params.id} of profile update`);
    sendNotification(
      req.params.id,
      'Account Updated',
      'Your user account information has been updated.'
    )
    .then(() => console.log(`✅ [Notification] User update notice sent to user ${req.params.id}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify user ${req.params.id}:`, e));
  } catch (err) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'User deleted' });

    // Notify user
    console.log(`▶️ [Notification] Notifying user ${req.params.id} of account deletion`);
    sendNotification(
      req.params.id,
      'Account Deleted',
      'Your user account has been deleted.'
    )
    .then(() => console.log(`✅ [Notification] Deletion notice sent to user ${req.params.id}`))
    .catch((e) => console.error(`❌ [Notification] Deletion notice failed for user ${req.params.id}:`, e));
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    await User.assignRole(req.params.id, roleId);
    res.status(204).end();

    // Notify user
    console.log(`▶️ [Notification] Notifying user ${req.params.id} of role assignment`);
    sendNotification(
      req.params.id,
      'Role Assigned',
      `A new role has been assigned to your user account.`
    )
    .then(() => console.log(`✅ [Notification] Role assignment sent to user ${req.params.id}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify user ${req.params.id} about role assignment:`, e));
  } catch (err) {
    res.status(500).json({ message: 'Error assigning role' });
  }
};

exports.removeRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    await User.removeRole(req.params.id, roleId);
    res.status(204).end();

    // Notify user
    console.log(`▶️ [Notification] Notifying user ${req.params.id} of role removal`);
    sendNotification(
      req.params.id,
      'Role Removed',
      'A role has been removed from your user account.'
    )
    .then(() => console.log(`✅ [Notification] Role removal sent to user ${req.params.id}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify user ${req.params.id} about role removal:`, e));
  } catch (err) {
    res.status(500).json({ message: 'Error removing role' });
  }
};

exports.resetTempPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const tempPassword = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(tempPassword, 10);

    await db.query(
      `UPDATE users SET password_hash = $1, temp_password = $2, password_reset_required = TRUE WHERE id = $3`,
      [hash, tempPassword, userId]
    );

    res.json({ tempPassword });

    // Notify user
    console.log(`▶️ [Notification] Notifying user ${userId} of temporary password reset`);
    sendNotification(
      userId,
      'Temporary Password Reset',
      `Your password has been reset. Temporary password: ${tempPassword}`
    )
    .then(() => console.log(`✅ [Notification] Temp password sent to user ${userId}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify user ${userId} about password reset:`, e));
  } catch (e) {
    console.error('Error resetting password:', e);
    res.status(500).json({ message: 'Reset failed.' });
  }
};

exports.unlockUser = async (req, res) => {
  try {
    await db.query(
      `UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = $1`,
      [req.params.id]
    );
    res.status(204).end();

    // Optional: notify user
    console.log(`▶️ [Notification] Notifying user ${req.params.id} of account unlock`);
    sendNotification(
      req.params.id,
      'Account Unlocked',
      'Your account has been unlocked and is now accessible.'
    )
    .then(() => console.log(`✅ [Notification] Account unlock notice sent to user ${req.params.id}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify user ${req.params.id} about account unlock:`, e));
  } catch (e) {
    console.error('Unlock error:', e);
    res.status(500).json({ message: 'Unlock failed.' });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const { active } = req.body;
    await db.query(`UPDATE users SET is_active = $1 WHERE id = $2`, [active, req.params.id]);
    res.status(204).end();

    // Notify user
    console.log(`▶️ [Notification] Notifying user ${req.params.id} of active status change`);
    sendNotification(
      req.params.id,
      'Account Status Changed',
      `Your account has been ${active ? 'activated' : 'deactivated'}.`
    )
    .then(() => console.log(`✅ [Notification] Active status update sent to user ${req.params.id}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify user ${req.params.id} about active status change:`, e));
  } catch (e) {
    console.error('Error toggling active status:', e);
    res.status(500).json({ message: 'Toggle active failed.' });
  }
};
