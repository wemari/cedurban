const db = require('../config/db');

// Fetch paginated notifications
const getByMemberId = async (memberId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const result = await db.query(
    `SELECT id, title, message, is_read, type, created_at, scheduled_at 
     FROM notifications 
     WHERE member_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [memberId, parseInt(limit), offset]
  );
  return result.rows;
};

// Count total notifications
const countByMemberId = async (memberId) => {
  const result = await db.query(
    'SELECT COUNT(*) AS total FROM notifications WHERE member_id = $1',
    [memberId]
  );
  return parseInt(result.rows[0].total, 10);
};

// Mark a single notification as read
const markAsRead = async (id) => {
  return db.query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
};

// Mark all notifications as read for a member
const markAllAsRead = async (memberId) => {
  return db.query('UPDATE notifications SET is_read = true WHERE member_id = $1', [memberId]);
};

// Create a new notification
const create = async (
  memberId,
  title,
  message,
  type = 'announcement',
  scheduledAt = null,
  recurrence = 'none',
  groupId = null,
  isGlobal = false,
  departmentId = null,
  memberType = null
) => {
  const result = await db.query(
    `INSERT INTO notifications (
      member_id, title, message, type, scheduled_at, recurrence,
      group_id, is_global, department_id, member_type
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [
      memberId,
      title,
      message,
      type,
      scheduledAt,
      recurrence,
      groupId,
      isGlobal,
      departmentId,
      memberType,
    ]
  );
  return result.rows[0];
};

// Export all functions
module.exports = {
  getByMemberId,
  countByMemberId,
  markAsRead,
  markAllAsRead,
  create,
};
