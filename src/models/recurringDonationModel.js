const db = require('../config/db');

async function create(data) {
  const {
    member_id, amount, category, method,
    interval_unit, interval_count, next_run_date
  } = data;

  const sql = `
    INSERT INTO public.recurring_donations
      (member_id, amount, category, method,
       interval_unit, interval_count, next_run_date)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`;

  const vals = [
    member_id, amount, category, method,
    interval_unit, interval_count, next_run_date
  ];

  const { rows } = await db.query(sql, vals);
  return rows[0];
}

async function listActive() {
  const { rows } = await db.query(`
    SELECT * FROM public.recurring_donations
    WHERE active = TRUE AND next_run_date <= CURRENT_DATE
    ORDER BY next_run_date ASC
  `);
  return rows;
}

async function updateNextRun(id, nextDate) {
  await db.query(
    `UPDATE public.recurring_donations
     SET next_run_date = $1, updated_at = NOW()
     WHERE id = $2`,
    [nextDate, id]
  );
}

async function cancel(id) {
  await db.query(
    `UPDATE public.recurring_donations
     SET active = FALSE, updated_at = NOW()
     WHERE id = $1`,
    [id]
  );
}

async function update(id, fields) {
  const allowedFields = ['amount', 'interval_unit', 'interval_count', 'next_run_date', 'active'];
  const setClauses = [], vals = [];
  let idx = 1;

  for (const key of allowedFields) {
    if (fields[key] !== undefined && fields[key] !== null) {
      setClauses.push(`${key} = $${idx}`);
      vals.push(fields[key]);
      idx++;
    }
  }

  if (setClauses.length === 0) return false; // No valid fields provided

  vals.push(id); // WHERE clause parameter

  const sql = `
    UPDATE public.recurring_donations
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
  `;

  await db.query(sql, vals);
  return true;
}

module.exports = {
  create,
  listActive,
  updateNextRun,
  cancel,
  update,
  remove: cancel // alias
};
