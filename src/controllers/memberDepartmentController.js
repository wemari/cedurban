const model = require('../models/memberDepartmentModel');
const { sendNotification } = require('../services/notificationService');

exports.createAssignment = async (req, res) => {
  try {
    const { member_id, department_id, role, date_joined } = req.body;

    console.log('Received create assignment payload:', req.body);

    if (!member_id || !department_id) {
      return res.status(400).json({ message: 'member_id and department_id are required' });
    }

    const item = await model.createAssignment({
      member_id,
      department_id,
      role: role || null,
      date_joined: date_joined || null
    });

    res.status(201).json(item);

    // Notify member
    console.log(`▶️ [Notification] Notifying member ${member_id} of department assignment`);
    sendNotification(
      member_id,
      'Department Assignment',
      'You have been assigned to a new department.'
    )
    .then(() => console.log(`✅ [Notification] Department assignment notice sent to member ${member_id}`))
    .catch((e) => console.error(`❌ [Notification] Department assignment failed for member ${member_id}:`, e));

  } catch (err) {
    console.error('Error in createAssignment:', err);
    res.status(500).json({ message: 'Error creating assignment', error: err.message });
  }
};

exports.getAllAssignments = async (req, res) => {
  try {
    const list = await model.getAllAssignments();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving assignments' });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const item = await model.getAssignmentById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving assignment' });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const item = await model.updateAssignment(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);

    // Notify member
    console.log(`▶️ [Notification] Notifying member ${item.member_id} of department assignment update`);
    sendNotification(
      item.member_id,
      'Department Assignment Updated',
      'Your department assignment has been updated.'
    )
    .then(() => console.log(`✅ [Notification] Assignment update notice sent to member ${item.member_id}`))
    .catch((e) => console.error(`❌ [Notification] Assignment update failed for member ${item.member_id}:`, e));

  } catch (err) {
    res.status(500).json({ message: 'Error updating assignment' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const item = await model.deleteAssignment(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Deleted successfully' });

    // Notify member
    console.log(`▶️ [Notification] Notifying member ${item.member_id} of department removal`);
    sendNotification(
      item.member_id,
      'Department Assignment Removed',
      'You have been removed from your department assignment.'
    )
    .then(() => console.log(`✅ [Notification] Assignment deletion notice sent to member ${item.member_id}`))
    .catch((e) => console.error(`❌ [Notification] Assignment deletion failed for member ${item.member_id}:`, e));

  } catch (err) {
    res.status(500).json({ message: 'Error deleting assignment' });
  }
};
