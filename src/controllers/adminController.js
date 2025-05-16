const {
  updateFirstTimers,
  updateNewConverts,
  populateFromMembers
} = require('../services/autoMemberUpdater');

exports.runManualUpdate = async (req, res) => {
  try {
    console.log('[Manual Update] Running...');
    await populateFromMembers();
    await updateFirstTimers();
    await updateNewConverts();
    res.json({ message: 'Manual update complete' });
  } catch (err) {
    console.error('[ADMIN UPDATE ERROR]:', err);
    res.status(500).json({ error: 'Manual update failed' });
  }
};
