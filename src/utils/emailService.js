// utils/emailService.js
const nodemailer = require('nodemailer');

async function sendWelcomeEmail(toEmail, tempPassword, name) {
  // Create a test SMTP account with Ethereal (free)
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Your App" <noreply@yourapp.com>',
    to: toEmail,
    subject: 'Welcome! Here is your temporary password',
    html: `<p>Hi ${name},</p>
           <p>Your temporary password is: <strong>${tempPassword}</strong></p>
           <p>Please log in and reset your password.</p>`,
  });

  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

module.exports = { sendWelcomeEmail };
