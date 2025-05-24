const memberFamilyModel = require('../models/memberFamilyModel');
const { sendNotification } = require('../services/notificationService');

// Create Family Link
exports.createFamilyLink = async (req, res) => {
  try {
    const link = await memberFamilyModel.createFamilyLink(req.body);
    res.status(201).json(link);

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${link.member_id} of new family link`);
    sendNotification(
      link.member_id,
      'New Family Link',
      'A new family relationship has been added to your profile.'
    )
    .then(() => console.log(`✅ [Notification] Family link creation notice sent to member ${link.member_id}`))
    .catch((e) => console.error(`❌ [Notification] Family link creation failed for member ${link.member_id}:`, e));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating family link' });
  }
};

// Get All Family Links
exports.getAllFamilyLinks = async (req, res) => {
  try {
    const data = await memberFamilyModel.getAllFamilyLinks();
    res.json(data);
  } catch (err) {
    console.error('Error fetching family links:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Single Family Link
exports.getFamilyLinkById = async (req, res) => {
  try {
    const link = await memberFamilyModel.getFamilyLinkById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Family link not found' });
    res.json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving family link' });
  }
};

// Update Family Link
exports.updateFamilyLink = async (req, res) => {
  try {
    const updated = await memberFamilyModel.updateFamilyLink(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Family link not found' });
    res.json(updated);

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${updated.member_id} of updated family link`);
    sendNotification(
      updated.member_id,
      'Family Link Updated',
      'A family relationship on your profile has been updated.'
    )
    .then(() => console.log(`✅ [Notification] Family link update notice sent to member ${updated.member_id}`))
    .catch((e) => console.error(`❌ [Notification] Family link update failed for member ${updated.member_id}:`, e));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating family link' });
  }
};

// Delete Family Link
exports.deleteFamilyLink = async (req, res) => {
  try {
    // Optional: fetch before deletion to retain member_id
    const link = await memberFamilyModel.getFamilyLinkById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Family link not found' });

    await memberFamilyModel.deleteFamilyLink(req.params.id);
    res.json({ message: 'Family link deleted successfully' });

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${link.member_id} of deleted family link`);
    sendNotification(
      link.member_id,
      'Family Link Removed',
      'A family relationship has been removed from your profile.'
    )
    .then(() => console.log(`✅ [Notification] Family link deletion notice sent to member ${link.member_id}`))
    .catch((e) => console.error(`❌ [Notification] Family link deletion failed for member ${link.member_id}:`, e));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting family link' });
  }
};
