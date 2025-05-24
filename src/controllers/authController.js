const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../services/emailSmsService');       // ✅ Correct
require('dotenv').config();
const db = require('../config/db');

// Lockout policy config
const MAX_FAILED = parseInt(process.env.MAX_FAILED, 10) || 5;
const LOCK_DURATION_MINUTES = parseInt(process.env.LOCK_DURATION_MINUTES, 10) || 15;

// POST /auth/register — Email-only Registration
exports.register = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const existing = await User.getByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const user = await User.createWithoutPassword(email);

    // Log user object
    console.log("✅ Registered user:", user); // Add this line for debugging

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_VERIFY_SECRET,
      { expiresIn: '24h' }
    );

    const verifyUrl = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${token}`;

    // LOG email just before sending
    console.log("📬 Sending verification email to:", user.email);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email',
        html: `<p>Welcome! Click <a href="${verifyUrl}">here</a> to verify your email and set your password. This link expires in 24 hours.</p>`
      });
    } catch (mailErr) {
      console.error('⚠️ Failed to send verification email:', mailErr.message);
    }

    res.status(201).json({ message: 'User registered. Verification email (if possible) sent.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed.' });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if account is locked
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      const msLeft = new Date(user.lockout_until) - new Date();
      const minsLeft = Math.ceil(msLeft / 60000);
      return res
        .status(403)
        .json({ message: `Account locked. Try again in ${minsLeft} minute(s).` });
    }

    // Check password (temp or permanent)
    const isTemp = user.password_reset_required && user.temp_password;
    const hashToCheck = isTemp ? user.temp_password : user.password_hash;
    const valid = await bcrypt.compare(password, hashToCheck);

    if (!valid) {
      await User.incrementFailedAttempts(user.id);
      const updated = await User.getByEmail(email);
      const attempts = updated.failed_login_attempts;

      if (attempts >= MAX_FAILED) {
        await User.lockAccount(user.id, LOCK_DURATION_MINUTES);
        return res
          .status(403)
          .json({ message: 'Account locked due to too many failed attempts.' });
      }

      const triesLeft = MAX_FAILED - attempts;
      return res
        .status(401)
        .json({ message: `Invalid credentials. ${triesLeft} attempt(s) remaining.` });
    }

    // Login success
    await User.resetFailedAttempts(user.id);
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      forcePasswordReset: user.password_reset_required,
      roles: user.roles,
      permissions: await User.getPermissions(user.id),
      userRole: user.userRole,
      memberId: user.memberId
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed.' });
  }
};

// POST /auth/request-reset
exports.requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.getByEmail(email);

    // Always respond the same to avoid email enumeration
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, reset instructions have been sent.' });
    }

    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Instructions',
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to set a new password. This link expires in 1 hour.</p>`
    });

    res.json({ message: 'If the email exists, reset instructions have been sent.' });
  } catch (err) {
    console.error('Request reset error:', err);
    res.status(500).json({ message: 'Reset request failed' });
  }
};

// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const payload = jwt.verify(token, process.env.JWT_RESET_SECRET);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(payload.userId, passwordHash);

    res.json({ message: 'Password reset successful. You may now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ message: 'Invalid or expired reset token.' });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required.' });
    }

    // Verify JWT token using secret
    const payload = jwt.verify(token, process.env.JWT_VERIFY_SECRET);

    // Hash the new password
    const hash = await bcrypt.hash(password, 10);

    // Update user password, mark verified and clear reset flags
    await db.query(`
      UPDATE users
      SET password_hash = $1,
          is_verified = TRUE,
          password_reset_required = FALSE
      WHERE id = $2
    `, [hash, payload.userId]);

    res.json({ message: 'Email verified and password set. You can now log in.' });
  } catch (err) {
    console.error('Verification failed:', err.message);
    res.status(400).json({ message: 'Invalid or expired verification token.' });
  }
};
