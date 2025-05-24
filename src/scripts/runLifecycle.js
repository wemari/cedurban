// Run manually via CLI: node scripts/runLifecycle.js
const run = require('../src/services/memberLifecycleManager');

run().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
