// server/models/contributionModel.js
const pool = require('../config/db');

const Contribution = {
  async findByMember(memberId) {
    const { rows } = await pool.query(`
      SELECT id, category AS type, amount, method, transaction_date, proof_url
        FROM income_transactions
       WHERE member_id = $1
      UNION ALL
      SELECT id, category AS type, amount, payment_method AS method, transaction_date, proof_url
        FROM expense_transactions
       WHERE member_id = $1
      ORDER BY transaction_date DESC
    `, [memberId]);
    return rows;
  },

  async add(memberId, { amount, type }) {
    const { rows } = await pool.query(`
      INSERT INTO income_transactions
        (member_id, amount, category, method, transaction_date)
      VALUES ($1,$2,$3,'Online', CURRENT_DATE)
      RETURNING id, category AS type, amount, method, transaction_date, proof_url
    `, [memberId, amount, type]);
    return rows[0];
  },

  async setProof(contribId, proofUrl) {
    // Try income
    let res = await pool.query(
      `UPDATE income_transactions SET proof_url=$2 WHERE id=$1 RETURNING id`,
      [contribId, proofUrl]
    );
    if (res.rowCount) return res.rows[0];
    // Fallback to expense
    res = await pool.query(
      `UPDATE expense_transactions SET proof_url=$2 WHERE id=$1 RETURNING id`,
      [contribId, proofUrl]
    );
    return res.rows[0];
  }
};

module.exports = Contribution;
