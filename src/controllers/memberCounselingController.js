const MemberCounseling = require('../models/memberCounselingModel');
const { sendNotification } = require('../services/notificationService');

exports.list = async (req, res, next) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const result = await MemberCounseling.getMemberCounselings(memberId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const sessionData = req.body; 
    const newSession = await MemberCounseling.createMemberCounseling(memberId, sessionData);
    res.status(201).json(newSession);

    // Send notification
    console.log(`▶️ [Notification] Notifying member ${memberId} about new counseling session`);
    sendNotification(
      memberId,
      'New Counseling Session',
      'A new counseling session has been scheduled for you.'
    )
    .then(() => console.log(`✅ [Notification] Counseling creation notice sent to member ${memberId}`))
    .catch((e) => console.error(`❌ [Notification] Counseling creation failed for member ${memberId}:`, e));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);
    const updatedData = req.body;
    const updated = await MemberCounseling.updateMemberCounseling(sessionId, updatedData);
    const updatedSession = updated.rows[0];
    res.json(updatedSession);

    // Notify member
    console.log(`▶️ [Notification] Notifying member ${updatedSession.member_id} about counseling session update`);
    sendNotification(
      updatedSession.member_id,
      'Counseling Session Updated',
      'Your counseling session details have been updated.'
    )
    .then(() => console.log(`✅ [Notification] Counseling update notice sent to member ${updatedSession.member_id}`))
    .catch((e) => console.error(`❌ [Notification] Counseling update failed for member ${updatedSession.member_id}:`, e));
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const memberCounselingId = parseInt(req.params.memberCounselingId, 10);
    const sessionId = parseInt(req.params.sessionId, 10);

    // Optional: Get member ID before deleting if your model doesn't return it
    const session = await MemberCounseling.getCounselingSession(sessionId); // You'll need to implement this in your model
    const memberId = session?.member_id;

    await MemberCounseling.deleteMemberCounseling(memberCounselingId, sessionId);
    res.status(204).end();

    if (memberId) {
      // Notify member
      console.log(`▶️ [Notification] Notifying member ${memberId} about counseling session deletion`);
      sendNotification(
        memberId,
        'Counseling Session Cancelled',
        'Your counseling session has been cancelled.'
      )
      .then(() => console.log(`✅ [Notification] Counseling deletion notice sent to member ${memberId}`))
      .catch((e) => console.error(`❌ [Notification] Counseling deletion failed for member ${memberId}:`, e));
    }
  } catch (err) {
    next(err);
  }
};
