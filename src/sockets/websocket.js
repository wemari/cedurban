const { Server } = require('socket.io');
let io;

function init(server) {
  io = new Server(server, {
    cors: {
      origin: '*',  // Allow all origins for development
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    const rawMemberId = socket.handshake.query.memberId;

    // Validate memberId is a valid integer
    const memberId = parseInt(rawMemberId, 10);
    if (!memberId || isNaN(memberId)) {
      console.error(`❌ Socket ${socket.id} failed to join: invalid or missing memberId ->`, rawMemberId);
      return socket.disconnect(true);  // Disconnect if invalid
    }

    socket.join(`member_${memberId}`);
    console.log(`✅ Socket ${socket.id} joined room member_${memberId}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket ${socket.id} disconnected from room member_${memberId}`);
    });
  });
}

function sendNotificationToMember(memberId, notificationData) {
  const socket = getIO();
  socket.to(`member_${memberId}`).emit('new_notification', notificationData);
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized—you must call init(server) first');
  return io;
}

module.exports = { init, getIO, sendNotificationToMember };
