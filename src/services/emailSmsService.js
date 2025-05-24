// services/emailSmsService.js

const nodemailer = require('nodemailer');
const Twilio = require('twilio');
require('dotenv').config();

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify((error) => {
  if (error) console.error('❌ Email transporter failed:', error);
  else console.log('✅ Email transporter is ready');
});

// Twilio client setup
const twilioClient = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Send Email
async function sendEmail({ to, subject, html }) {
  if (!to || typeof to !== 'string') throw new Error('Invalid recipient email address');

  const info = await transporter.sendMail({
    from: `"My App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  });

  console.log('✅ Email sent:', info.messageId);
  return info;
}

// Send SMS
async function sendSms(to, body) {
  const msg = await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });

  console.log('✅ SMS sent:', msg.sid);
  return msg;
}

module.exports = { sendEmail, sendSms };
