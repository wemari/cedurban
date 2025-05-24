const notificationModel = require('../models/notificationModel');
const { sendEmail, sendSms } = require('../services/emailSmsService');
const memberModel = require('../models/memberModel');
const websocket = require('../sockets/websocket');

exports.getMemberNotifications = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const notifications = await notificationModel.getByMemberId(memberId, page, limit);
    const total = await notificationModel.countByMemberId(memberId);
    res.json({ notifications, hasMore: page * limit < total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await notificationModel.markAsRead(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await notificationModel.markAllAsRead(req.params.memberId);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  const payload = {
    member_id: req.body.member_id ?? null,
    group_id: req.body.group_id ?? null,
    department_id: req.body.department_id ?? null,
    member_type: req.body.member_type ?? null,
    is_global: req.body.is_global ?? false,
    title: req.body.title,
    message: req.body.message,
    type: req.body.type ?? 'announcement',
    via_email: req.body.viaEmail ?? false,
    via_sms: req.body.viaSms ?? false,
    scheduled_at: req.body.scheduled_at ?? null,
    recurrence: req.body.recurrence ?? 'none'
  };

  if (!payload.is_global && !payload.member_id && !payload.group_id && !payload.department_id && !payload.member_type) {
    return res.status(400).json({ error: 'No target specified' });
  }

  try {
    const io = websocket.getIO();
    const recipients = await exports.getRecipientIds(payload);

    for (const { id } of recipients) {
      const notif = await notificationModel.create({ ...payload, member_id: id });
      io.to(`member_${id}`).emit('new_notification', notif);

      const m = await memberModel.getById(id);

      if (payload.via_email && m.email) {
        try {
          await sendEmail({ 
            to: m.email, 
            subject: payload.title, 
            html: `<p>${payload.message}</p>` 
          });
        } catch (err) {
          console.error(`Failed to send email to ${m.email} for member ${id}:`, err);
        }
      }

      if (payload.via_sms && m.contact_primary) {
        try {
          await sendSms(m.contact_primary, payload.message);
        } catch (err) {
          console.error(`Failed to send SMS to ${m.contact_primary} for member ${id}:`, err);
        }
      }
    }

    res.status(201).json({ message: `Sent to ${recipients.length}`, count: recipients.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecipientIds = async function(payload) {
  const db = require('../config/db');
  let rows = [];
  if (payload.is_global) {
    ({ rows } = await db.query('SELECT id FROM members'));
  } else if (payload.group_id) {
    ({ rows } = await db.query(
      'SELECT m.id FROM members m JOIN member_cell_group mcg ON m.id=mcg.member_id WHERE mcg.cell_group_id=$1',
      [payload.group_id]
    ));
  } else if (payload.department_id) {
    ({ rows } = await db.query(
      'SELECT m.id FROM members m JOIN member_department md ON m.id=md.member_id WHERE md.department_id=$1',
      [payload.department_id]
    ));
  } else if (payload.member_type) {
    ({ rows } = await db.query(
      'SELECT id FROM members WHERE member_type=$1',
      [payload.member_type]
    ));
  } else if (payload.member_id) {
    rows = [{ id: payload.member_id }];
  }
  // Remove duplicates by member id
  return [...new Map(rows.map(r => [r.id, r])).values()];
};
