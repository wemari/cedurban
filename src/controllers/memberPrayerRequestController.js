const MemberPrayerRequest = require('../models/memberPrayerRequestModel');
const { sendNotification } = require('../services/notificationService');

// GET all prayer requests for a member
exports.list = async (req, res, next) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const result = await MemberPrayerRequest.getMemberPrayerRequests(memberId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// CREATE a prayer request
exports.create = async (req, res, next) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const { request, status } = req.body;

    const result = await MemberPrayerRequest.createPrayerRequest(memberId, request, status);
    const newRequest = result.rows[0];
    res.status(201).json(newRequest);

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${memberId} of new prayer request`);
    sendNotification(
      memberId,
      'Prayer Request Submitted',
      'Your prayer request has been received. We are standing with you in faith.'
    )
    .then(() => console.log(`✅ [Notification] Prayer request creation notice sent to member ${memberId}`))
    .catch((e) => console.error(`❌ [Notification] Prayer request creation failed for member ${memberId}:`, e));

  } catch (err) {
    next(err);
  }
};

// UPDATE a prayer request
exports.update = async (req, res, next) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const id = parseInt(req.params.id, 10);
    const { request, status } = req.body;

    const result = await MemberPrayerRequest.updatePrayerRequest(memberId, id, request, status);
    const updatedRequest = result.rows[0];
    res.json(updatedRequest);

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${memberId} of updated prayer request`);
    sendNotification(
      memberId,
      'Prayer Request Updated',
      'Your prayer request has been updated.'
    )
    .then(() => console.log(`✅ [Notification] Prayer request update notice sent to member ${memberId}`))
    .catch((e) => console.error(`❌ [Notification] Prayer request update failed for member ${memberId}:`, e));

  } catch (err) {
    next(err);
  }
};

// DELETE a prayer request
exports.delete = async (req, res, next) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const id = parseInt(req.params.id, 10);

    await MemberPrayerRequest.deletePrayerRequest(memberId, id);
    res.status(204).end();

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${memberId} of deleted prayer request`);
    sendNotification(
      memberId,
      'Prayer Request Removed',
      'Your prayer request has been removed.'
    )
    .then(() => console.log(`✅ [Notification] Prayer request deletion notice sent to member ${memberId}`))
    .catch((e) => console.error(`❌ [Notification] Prayer request deletion failed for member ${memberId}:`, e));

  } catch (err) {
    next(err);
  }
};
