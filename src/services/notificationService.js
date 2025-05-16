// src/services/notificationService.js
const notificationModel = require('../models/notificationModel');
const { getIO } = require('../sockets/websocket');

async function sendNotification(memberId, title, message) {
  // 1) Persist
  const newNotif = await notificationModel.create(memberId, title, message);
  console.log(`📨 DB saved notification ${newNotif.id} for ${memberId}`);

  // 2) Emit
  const io = getIO();
  io.to(`member_${memberId}`)
    .emit('new_notification', newNotif);
  console.log(`🚀 Emitted new_notification to member_${memberId}`);

  return newNotif;
}

module.exports = { sendNotification };
