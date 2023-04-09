const pool = require("../db");

// get all posted jobs
exports.getAllJobs = async () => {
  const allJobs = await pool.query("SELECT * FROM jobs");
  return allJobs.rows;
};
// get a posted job detail based on id
exports.getJobDetails = async (id) => {
  const jobDetails = await pool.query("SELECT * FROM jobs WHERE id=$1", [id]);
  return jobDetails.rows;
};
// update a posted job detail based on id
exports.updateJob = async (id, isActive) => {
  const updateJob = await pool.query(
    "UPDATE jobs SET is_active=$2 WHERE id=$1",
    [id, isActive]
  );
  return updateJob.rows;
};
