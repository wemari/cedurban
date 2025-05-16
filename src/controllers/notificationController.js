const notificationModel = require('../models/notificationModel');
const websocket = require('../sockets/websocket');
const db = require('../config/db'); // Import db for direct queries

exports.getMemberNotifications = async (req, res) => {
  const memberId = req.params.memberId;
  const { page = 1, limit = 10 } = req.query;

  try {
    // Fetch notifications with pagination
    const notifications = await notificationModel.getByMemberId(memberId, page, limit);

    // Count total notifications for pagination
    const total = await notificationModel.countByMemberId(memberId);
    const hasMore = page * limit < total;

    // Respond with the expected format
    res.json({
      notifications,
      hasMore,
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    await notificationModel.markAsRead(id);
    res.sendStatus(204);
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await notificationModel.markAllAsRead(req.params.memberId);
    res.sendStatus(204);
  } catch (err) {
    console.error('Failed to mark all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Create a new notification (supporting types, groups, departments, etc

exports.createNotification = async (req, res) => {
  const {
    member_id = null,
    group_id = null,
    department_id = null,
    member_type = null,
    is_global = false,
    title,
    message,
    type = 'announcement',
    scheduled_at = null,
    recurrence = 'none',
  } = req.body;

  if (!is_global && !member_id && !group_id && !department_id && !member_type) {
    return res.status(400).json({
      error: 'Specify at least one target: member_id, group_id, department_id, member_type, or set is_global',
    });
  }

  const io = websocket.getIO();
  let deliveredTo = [];

  try {
    // 1. Send to specific member
    if (member_id) {
      const notif = await notificationModel.create(
        member_id,
        title,
        message,
        type,
        scheduled_at,
        recurrence,
        group_id,
        false,
        department_id,
        member_type
      );
      io.to(`member_${member_id}`).emit('new_notification', notif);
      deliveredTo.push(member_id);
    }

    // 2. Send to all members in a group
    if (group_id) {
      const result = await db.query(`
        SELECT m.id FROM members m
        JOIN member_cell_group mcg ON m.id = mcg.member_id
        WHERE mcg.cell_group_id = $1
      `, [group_id]);

      for (const { id } of result.rows) {
        const notif = await notificationModel.create(
          id,
          title,
          message,
          type,
          scheduled_at,
          recurrence,
          group_id,
          false,
          null,
          null
        );
        io.to(`member_${id}`).emit('new_notification', notif);
        deliveredTo.push(id);
      }
    }

    // 3. Send to all members in a department
    if (department_id) {
      const result = await db.query(`
        SELECT m.id FROM members m
        JOIN member_department md ON m.id = md.member_id
        WHERE md.department_id = $1
      `, [department_id]);

      for (const { id } of result.rows) {
        const notif = await notificationModel.create(
          id,
          title,
          message,
          type,
          scheduled_at,
          recurrence,
          null,
          false,
          department_id,
          null
        );
        io.to(`member_${id}`).emit('new_notification', notif);
        deliveredTo.push(id);
      }
    }

    // 4. Send to all members of a specific member_type
    if (member_type) {
      const result = await db.query(`SELECT id FROM members WHERE member_type = $1`, [member_type]);

      for (const { id } of result.rows) {
        const notif = await notificationModel.create(
          id,
          title,
          message,
          type,
          scheduled_at,
          recurrence,
          null,
          false,
          null,
          member_type
        );
        io.to(`member_${id}`).emit('new_notification', notif);
        deliveredTo.push(id);
      }
    }

    // 5. Send to ALL members
    if (is_global) {
      const result = await db.query(`SELECT id FROM members`);

      for (const { id } of result.rows) {
        const notif = await notificationModel.create(
          id,
          title,
          message,
          type,
          scheduled_at,
          recurrence,
          null,
          true,
          null,
          null
        );
        io.to(`member_${id}`).emit('new_notification', notif);
        deliveredTo.push(id);
      }
    }

    // Respond with delivery info
    const uniqueRecipients = [...new Set(deliveredTo)];
    return res.status(201).json({
      message: `Notification delivered to ${uniqueRecipients.length} member(s)`,
      count: uniqueRecipients.length,
      recipient_ids: uniqueRecipients,
    });

  } catch (err) {
    console.error('Error creating notification:', err);
    return res.status(500).json({ error: 'Failed to create notification' });
  }
};

