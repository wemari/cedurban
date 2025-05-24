const nextOfKinModel = require('../models/nextOfKinModel');
const { sendNotification } = require('../services/notificationService');

// Create Next of Kin
exports.createNextOfKin = async (req, res) => {
  try {
    const nextOfKin = await nextOfKinModel.createNextOfKin(req.body);
    res.status(201).json(nextOfKin);

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${nextOfKin.member_id} of new next of kin`);
    sendNotification(
      nextOfKin.member_id,
      'Next of Kin Added',
      'A new next of kin has been added to your profile.'
    )
    .then(() => console.log(`✅ [Notification] Next of kin creation notice sent to member ${nextOfKin.member_id}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify member ${nextOfKin.member_id} about next of kin creation:`, e));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating next of kin' });
  }
};

// Get All
exports.getAllNextOfKin = async (req, res) => {
  try {
    const list = await nextOfKinModel.getAllNextOfKin();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving next of kin list' });
  }
};

// Get Single
exports.getNextOfKinById = async (req, res) => {
  try {
    const item = await nextOfKinModel.getNextOfKinById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Next of kin not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving next of kin' });
  }
};

// Update
exports.updateNextOfKin = async (req, res) => {
  try {
    const updated = await nextOfKinModel.updateNextOfKin(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Next of kin not found' });
    res.json(updated);

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${updated.member_id} of updated next of kin`);
    sendNotification(
      updated.member_id,
      'Next of Kin Updated',
      'Your next of kin information has been updated.'
    )
    .then(() => console.log(`✅ [Notification] Next of kin update notice sent to member ${updated.member_id}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify member ${updated.member_id} about next of kin update:`, e));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating next of kin' });
  }
};

// Delete
exports.deleteNextOfKin = async (req, res) => {
  try {
    // Get the item before deletion to retrieve member_id
    const item = await nextOfKinModel.getNextOfKinById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Next of kin not found' });

    await nextOfKinModel.deleteNextOfKin(req.params.id);
    res.json({ message: 'Next of kin deleted successfully' });

    // Notify the member
    console.log(`▶️ [Notification] Notifying member ${item.member_id} of next of kin removal`);
    sendNotification(
      item.member_id,
      'Next of Kin Removed',
      'Your next of kin record has been removed from your profile.'
    )
    .then(() => console.log(`✅ [Notification] Next of kin deletion notice sent to member ${item.member_id}`))
    .catch((e) => console.error(`❌ [Notification] Failed to notify member ${item.member_id} about next of kin deletion:`, e));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting next of kin' });
  }
};
