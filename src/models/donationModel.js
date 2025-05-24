const db = require('../config/db');

const Donation = {
  async listAll() {
    const { rows } = await db.query(`
      SELECT d.*, m.first_name, m.surname
      FROM donations d
      JOIN members m ON m.id = d.member_id
      ORDER BY d.donation_date DESC
    `);
    return rows;
  },

  async getById(id) {
    const { rows } = await db.query(
      `SELECT * FROM donations WHERE id = $1`, [id]
    );
    return rows[0] || null;
  },

  async create({ member_id, amount, donation_date, method, status, proof_url }) {
    const { rows } = await db.query(
      `INSERT INTO donations
        (member_id, amount, donation_date, method, status, proof_url)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [member_id, amount, donation_date, method, status, proof_url || null]
    );
    return rows[0];
  },

  async update(id, { member_id, amount, donation_date, method, status, proof_url }) {
    const parts = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries({ member_id, amount, donation_date, method, status, proof_url })) {
      if (v !== undefined) {
        parts.push(`${k}=$${idx}`);
        vals.push(v);
        idx++;
      }
    }
    if (!parts.length) return null;
    vals.push(id);
    const { rows } = await db.query(
      `UPDATE donations
         SET ${parts.join(',')}, created_at = created_at  -- no-op to avoid missing SET
       WHERE id = $${idx}
       RETURNING *`,
      vals
    );
    return rows[0] || null;
  },

  async remove(id) {
    const { rowCount } = await db.query(
      `DELETE FROM donations WHERE id = $1`,
      [id]
    );
    return rowCount > 0;
  }
,

  async updateProofUrl(id, proofUrl) {
    const { rows } = await db.query(
      `UPDATE donations SET proof_url=$1 WHERE id=$2 RETURNING *`,
      [proofUrl, id]
    );
    return rows[0] || null;
  }

};

module.exports = Donation;



