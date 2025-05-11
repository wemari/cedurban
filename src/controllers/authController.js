const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../services/mailer');
require('dotenv').config();

// Lockout policy config
const MAX_FAILED = parseInt(process.env.MAX_FAILED, 10) || 5;
const LOCK_DURATION_MINUTES = parseInt(process.env.LOCK_DURATION_MINUTES, 10) || 15;

// POST /auth/register — mainly for manual user creation
// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existing = await User.getByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.createWithPassword({ email, passwordHash: hashedPassword });

    res.status(201).json({
      id: user.id,
      email: user.email
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
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

    await sendMail({
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
