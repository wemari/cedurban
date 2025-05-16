


require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { init } = require('./src/sockets/websocket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ▶️ Initialize Socket.IO here
init(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // your scheduler, etc.
  require('./src/scheduler/memberStatusScheduler');
  require('./src/scheduler/cron'); // path may vary depending on project structure

});
