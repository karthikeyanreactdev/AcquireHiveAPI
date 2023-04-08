const pool = require("../db");

exports.getAllCandidates = async () => {
  const allCandidates = await pool.query("SELECT * FROM candidates");
  return allCandidates.rows;
};
