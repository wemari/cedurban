const db = require('../config/db');

const eventsModel = {};

// Create a new event
eventsModel.create = async ({ name, description, event_date, location, qr_token, latitude, longitude, geofence_radius }) => {
  const sql = `
    INSERT INTO public.events
    (name, description, event_date, location, qr_token, latitude, longitude, geofence_radius)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`;
  const vals = [name, description, event_date, location, qr_token, latitude, longitude, geofence_radius];
  const { rows } = await db.query(sql, vals);
  return rows[0];
};

// List all events
eventsModel.findAll = async () => {
  const { rows } = await db.query(`SELECT * FROM public.events ORDER BY event_date DESC`);
  return rows;
};

// Get event by ID
eventsModel.findById = async (id) => {
  const { rows } = await db.query(`SELECT * FROM public.events WHERE id = $1`, [id]);
  return rows[0];
};

// Get events by member ID (attendance history)
eventsModel.findByMemberId = async (memberId) => {
  try {
    const sql = `
      SELECT e.*
      FROM public.events e
      INNER JOIN public.attendances a ON e.id = a.event_id
      WHERE a.member_id = $1
      ORDER BY e.event_date DESC`;
    const { rows } = await db.query(sql, [memberId]);

    if (rows.length === 0) {
      return []; // Return empty array if no events found for the member
    }

    return rows;
  } catch (err) {
    throw new Error('Error fetching events by member');
  }
};

// Update an event
eventsModel.update = async (id, fields) => {
  const sets = [];
  const vals = [];
  let idx = 1;
  for (const key in fields) {
    sets.push(`${key} = $${idx}`);
    vals.push(fields[key]);
    idx++;
  }
  vals.push(id);
  const sql = `
    UPDATE public.events
    SET ${sets.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING *`;
  const { rows } = await db.query(sql, vals);
  return rows[0];
};

// Delete an event
eventsModel.remove = async (id) => {
  await db.query(`DELETE FROM public.events WHERE id = $1`, [id]);
  return true;
};

// Get upcoming events with registration status for a member
eventsModel.findUpcomingWithRegistrationStatus = async (memberId) => {
  const sql = `
    SELECT e.*, 
      CASE WHEN r.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_registered
    FROM public.events e
    LEFT JOIN public.event_registrations r
      ON e.id = r.event_id AND r.member_id = $1
    WHERE e.event_date >= CURRENT_DATE
    ORDER BY e.event_date ASC`;
  const { rows } = await db.query(sql, [memberId]);
  return rows;
};

// Find existing registration for a member for an event
eventsModel.findRegistration = async (memberId, eventId) => {
  const result = await db.query(
    'SELECT * FROM event_registrations WHERE member_id = $1 AND event_id = $2',
    [memberId, eventId]
  );
  return result.rows;
};

// Create a new registration
eventsModel.createRegistration = async (memberId, eventId) => {
  const result = await db.query(
    `INSERT INTO event_registrations (member_id, event_id)
     VALUES ($1, $2) RETURNING *`,
    [memberId, eventId]
  );
  return result.rows[0];
};

// Get upcoming events excluding ones already registered
eventsModel.findUpcomingWithoutRegistered = async (memberId) => {
  const sql = `
    SELECT e.*
    FROM public.events e
    WHERE e.event_date >= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1
        FROM public.event_registrations r
        WHERE r.event_id = e.id
          AND r.member_id = $1
      )
    ORDER BY e.event_date ASC
  `;
  const { rows } = await db.query(sql, [memberId]);
  return rows;
};


module.exports = eventsModel;
