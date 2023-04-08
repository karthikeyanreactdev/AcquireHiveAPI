const pool = require("../db");

exports.getAllJobs = async () => {
  const allJobs = await pool.query("SELECT * FROM jobs");
  return allJobs.rows;
};
