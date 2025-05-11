const cron = require('node-cron');
const db = require('../config/db');
const { getIO } = require('../sockets/websocket');


// Returns the next scheduled_at date based on recurrence
function getNextScheduledAt(current, recurrence) {
  const next = new Date(current);
  if (recurrence === 'daily') next.setDate(next.getDate() + 1);
  if (recurrence === 'weekly') next.setDate(next.getDate() + 7);
  if (recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
  return next;
}

cron.schedule('* * * * *', async () => {
  const now = new Date();
  try {
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE scheduled_at IS NOT NULL 
       AND scheduled_at <= $1 
       AND (sent = false OR recurrence != 'none')`,
      [now]
    );

    const io = getIO();
    for (const notif of result.rows) {
      io.to(`member_${notif.member_id}`).emit('new_notification', notif);
      console.log(`🔔 Dispatched ${notif.recurrence} notification to member_${notif.member_id}`);

      if (notif.recurrence === 'none') {
        await db.query('UPDATE notifications SET sent = true WHERE id = $1', [notif.id]);
      } else {
        const next = getNextScheduledAt(new Date(notif.scheduled_at), notif.recurrence);
        await db.query(
          `UPDATE notifications 
           SET scheduled_at = $1, sent = false 
           WHERE id = $2`,
          [next, notif.id]
        );
      }
    }
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
});
