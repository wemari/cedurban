const express = require('express');
const router = express.Router();
const runLifecycleUpdate = require('../services/memberLifecycleManager');

router.post('/sync-lifecycle', async (req, res) => {
  try {
    await runLifecycleUpdate();
    res.json({ message: 'Lifecycle sync completed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lifecycle sync failed.' });
  }
});

module.exports = router;
