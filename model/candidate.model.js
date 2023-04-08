const pool = require("../db");

exports.getAllCandidates = async () => {
  const allCandidates = await pool.query("SELECT * FROM candidates");
  return allCandidates.rows;
};
exports.getCandidateDetails = async (email) => {
  const candidate = await pool.query(
    "SELECT * FROM candidates WHERE email=$1",
    [email]
  );
  return candidate.rows;
};

exports.addCandidate = async (userData) => {
  const user = await pool.query(
    "INSERT INTO candidates (full_name,mobile,email,score,status,skills,total_experiance,relavant_experiance,attempts,job_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
    [
      userData.fullName,
      userData.mobile,
      userData.email,
      userData.score,
      userData.status,
      userData.skills,
      userData.total_years_of_experiance,
      userData.relavant_experiance,
      "0",
      userData.job_id,
    ]
  );

  return user.rows;
};
exports.updateCandidate = async (userData) => {
  const user = await pool.query(
    "UPDATE candidates SET full_name =$1,mobile=$2,score=$4,status=$5,skills=$6,total_experiance=$7,relavant_experiance=$8,attempts=$9,job_id=$10  WHERE email=$3",
    [
      userData.fullName,
      userData.mobile,
      userData.email,
      userData.score,
      userData.status,
      userData.skills,
      userData.total_years_of_experiance,
      userData.relavant_experiance,
      "1",
      userData.job_id,
    ]
  );

  return user.rows;
};
