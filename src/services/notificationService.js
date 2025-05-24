const notificationModel = require('../models/notificationModel');
const { getIO } = require('../sockets/websocket');
const { getMemberContact } = require('../models/memberModel'); // Should return { email, phone }
const { sendEmail, sendSms } = require('./emailSmsService');   // Separated to avoid circular dependency

async function sendNotification(memberId, title, message, options = {}) {
  const {
    viaEmail = false,
    viaSms = false,
    context = 'default',
    metadata = {}
  } = options;

  // 1. Fetch member contact info
  let member = null;
  try {
    member = await getMemberContact(memberId);
  } catch (err) {
    console.error(`❌ Failed to fetch member contact for ID ${memberId}:`, err.message);
  }

  // 2. Create notification payload for DB
  const notificationPayload = {
    member_id: memberId,
    title,
    message,
    via_email: viaEmail,
    via_sms: viaSms,
    member_email: member?.email ?? null,
    member_phone: member?.phone ?? null,
    context,
    metadata: JSON.stringify(metadata)
  };

  // 3. Save to DB
  let newNotif;
  try {
    newNotif = await notificationModel.create(notificationPayload);
    console.log(`📨 Notification ${newNotif.id} created for member ${memberId}`);
  } catch (err) {
    console.error(`❌ Failed to create notification in DB:`, err.message);
    throw err;
  }

  // 4. Emit in-app notification
  try {
    const io = getIO();
    io.to(`member_${memberId}`).emit('new_notification', newNotif);
    console.log(`🚀 Emitted new_notification to member_${memberId}`);
  } catch (err) {
    console.error(`❌ Failed to emit notification to socket:`, err.message);
  }

  // 5. Optionally send email
  if (viaEmail && member?.email) {
    try {
      await sendEmail({
        to: member.email,
        subject: title,
        html: `<p>${message}</p>`
      });
      console.log(`✉️  Email sent to ${member.email}`);
    } catch (err) {
      console.error(`❌ Email send failed for ${member.email}:`, err.message);
    }
  }

  // 6. Optionally send SMS
  if (viaSms && member?.phone) {
    try {
      await sendSms(member.phone, message);
      console.log(`📱 SMS sent to ${member.phone}`);
    } catch (err) {
      console.error(`❌ SMS send failed for ${member.phone}:`, err.message);
    }
  }

  return newNotif;
}

module.exports = { sendNotification };
