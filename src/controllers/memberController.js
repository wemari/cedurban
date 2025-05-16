// src/controllers/memberController.js

const memberModel         = require('../models/memberModel');
const { sendNotification } = require('../services/notificationService');

const UPDATABLE_FIELDS = [
  'user_id', 'title', 'first_name', 'surname', 'date_of_birth',
  'contact_primary', 'contact_secondary', 'email', 'nationality', 'gender',
  'marital_status', 'num_children', 'physical_address', 'profession', 'occupation',
  'work_address', 'date_joined_church', 'date_born_again', 'date_baptized_immersion',
  'baptized_in_christ_embassy', 'date_received_holy_ghost', 'foundation_school_grad_date'
];

function normalize(val) {
  if (val === '' || val === 'null' || val === 'undefined' || val == null) {
    return null;
  }
  return typeof val === 'string' ? val.trim() : val;
}

exports.checkDuplicate = async (req, res) => {
  try {
    const { field, value } = req.query;
    if (!field || !value) {
      return res.status(400).json({ error: 'Missing field or value' });
    }
    const exists = await memberModel.checkDuplicateField(field, value);
    return res.json({ exists });
  } catch (err) {
    console.error('Duplicate check error:', err);
    return res.status(500).json({ error: 'Failed to check for duplicates' });
  }
};

exports.createMember = async (req, res, next) => {
  try {
    const photoPath = req.file
      ? `/uploads/profile_photos/${req.file.filename}`
      : null;

    // Check duplicates
    const dupEmail = await memberModel.checkDuplicateField('email', req.body.email);
    const dupPhone = await memberModel.checkDuplicateField('contact_primary', req.body.contact_primary);
    if (dupEmail || dupPhone) {
      return res.status(400).json({
        error: `Duplicate ${dupEmail ? 'email' : 'phone number'}`
      });
    }

    const data = { ...req.body, profile_photo: photoPath };
    const newMember = await memberModel.createMember(data);

    // 1) Respond to client
    res.status(201).json(newMember);

    // 2) Notify the new member
    console.log(`▶️ [Notification] Creating welcome notification for member ${newMember.id}`);
    sendNotification(
      newMember.id,
      'Welcome to the Church',
      'Your member profile has been created successfully.'
    )
      .then(() => console.log(`✅ [Notification] Welcome sent to member ${newMember.id}`))
      .catch((e) => console.error(`❌ [Notification] Welcome failed for member ${newMember.id}:`, e));

  } catch (err) {
    console.error('Error creating member:', err);
    next(err);
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const { member_type } = req.query;

    const members = member_type
      ? await memberModel.getMembersByType(member_type)
      : await memberModel.getAllMembers();

    return res.json(members);
  } catch (err) {
    console.error('Error retrieving members:', err);
    return res.status(500).json({ message: 'Error retrieving members' });
  }
};


exports.getMemberById = async (req, res) => {
  try {
    const member = await memberModel.getMemberById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    return res.json(member);
  } catch (err) {
    console.error('Error retrieving member:', err);
    return res.status(500).json({ message: 'Error retrieving member' });
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const fields = {};
    if (req.file) {
      fields.profile_photo = `/uploads/profile_photos/${req.file.filename}`;
    }

    UPDATABLE_FIELDS.forEach((key) => {
      if (req.body[key] !== undefined) {
        fields[key] = key === 'baptized_in_christ_embassy'
          ? (req.body[key] === 'true' || req.body[key] === true)
          : normalize(req.body[key]);
      }
    });

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided.' });
    }

    const updated = await memberModel.updateMember(req.params.id, fields);
    if (!updated) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    // 1) Respond to client
    res.json(updated);

    // 2) Notify the member of their profile update
    console.log(`▶️ [Notification] Notifying member ${req.params.id} of profile update`);
    sendNotification(
      req.params.id,
      'Profile Updated',
      'Your member profile has been updated successfully.'
    )
      .then(() => console.log(`✅ [Notification] Profile update sent to member ${req.params.id}`))
      .catch((e) => console.error(`❌ [Notification] Profile update failed for member ${req.params.id}:`, e));

  } catch (err) {
    console.error('Error updating member:', err);
    next(err);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const deleted = await memberModel.deleteMember(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // 1) Respond to client
    res.json({ message: 'Member deleted successfully' });

    // 2) Notify the (now-deleted) member account
    console.log(`▶️ [Notification] Notifying member ${req.params.id} of account deletion`);
    sendNotification(
      req.params.id,
      'Account Deleted',
      'Your member account has been deleted.'
    )
      .then(() => console.log(`✅ [Notification] Deletion notice sent to member ${req.params.id}`))
      .catch((e) => console.error(`❌ [Notification] Deletion notice failed for member ${req.params.id}:`, e));

  } catch (err) {
    console.error('Error deleting member:', err);
    next(err);
  }
};

// ── Finance & Gamification Controllers ───────────────────────────────────────

exports.getStats = async (req, res, next) => {
  try {
    const data = await memberModel.stats(+req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getHeatmap = async (req, res, next) => {
  try {
    const data = await memberModel.heatmap(+req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyGiving = async (req, res, next) => {
  try {
    const data = await memberModel.monthlyGiving(+req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getBadges = async (req, res, next) => {
  try {
    const data = await memberModel.badges(+req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};