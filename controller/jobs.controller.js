const jobsModel = require("../model/jobs.model");

// get all posted jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await jobsModel.getAllJobs();

    res.status(200).send({
      data: jobs,
      message: "Jobs fetched successfully.",
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};
// update job status active/in-active
exports.updateJobStatus = async (req, res) => {
  const { id, isActive } = req.body;
  try {
    const jobs = await jobsModel.updateJob(id, isActive);

    res.status(200).send({
      data: jobs,
      message: "Job updated successfully.",
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};
