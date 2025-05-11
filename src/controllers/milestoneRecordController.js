const model = require('../models/milestoneRecordModel');
const { sendNotification } = require('../services/notificationService');

// Get all milestone records by member
exports.getByMember = async (req, res) => {
  try {
    const memberId = req.params.member_id;
    const data = await model.getByMember(memberId);
    res.json(data);
  } catch (err) {
    console.error('[getByMember] Error:', err);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
};

// Create (assign) a milestone record
exports.create = async (req, res) => {
  try {
    const { member_id, template_id } = req.body;

    if (!member_id || !template_id) {
      return res.status(400).json({ error: 'member_id and template_id are required' });
    }

    console.log('[assignMilestone] Incoming:', { member_id, template_id });

    const data = await model.create(member_id, template_id);
    res.status(201).json(data);

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${member_id} of new milestone assignment`);
    sendNotification(
      member_id,
      'New Milestone Assigned',
      'A new milestone has been assigned to you. Please check your profile for details.'
    )
    .then(() => console.log(`✅ [Notification] Milestone assignment notice sent to member ${member_id}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify member ${member_id} about milestone assignment:`, e));

  } catch (err) {
    console.error('[assignMilestone] DB error:', err);
    res.status(500).json({ error: 'Failed to create milestone record' });
  }
};

// Delete a milestone record
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Optional: Get the member_id before deletion (if your model supports this)
    const record = await model.getById?.(id); // assumes this method exists for safety

    const data = await model.delete(id);
    res.json(data);

    // Notify the member (if we were able to retrieve the member_id)
    if (record && record.member_id) {
      console.log(`▶️ [Notification] Notifying member ${record.member_id} of milestone deletion`);
      sendNotification(
        record.member_id,
        'Milestone Removed',
        'A milestone has been removed from your profile.'
      )
      .then(() => console.log(`✅ [Notification] Milestone deletion notice sent to member ${record.member_id}`))
      .catch((e) => console.error(`❌ [Notification] Failed to notify member ${record.member_id} about milestone deletion:`, e));
    }

  } catch (err) {
    console.error('[deleteMilestone] DB error:', err);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
};

// Get all milestone records
exports.getAll = async (req, res) => {
  try {
    const data = await model.getAll();
    res.json(data);
  } catch (err) {
    console.error('[getAllMilestones] Error:', err);
    res.status(500).json({ error: 'Failed to fetch all milestones' });
  }
};
