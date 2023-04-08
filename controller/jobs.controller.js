const jobsModel = require("../model/jobs.model");

exports.getJobs = async (req, res) => {
  try {
    const jobs = await jobsModel.getAllJobs();

    res.status(200).send({
      status: true,
      data: jobs,
      message: "Jobs fetched successfully.",
    });
  } catch (err) {
    res.status(400).send({
      status: true,
      message: err.message,
    });
  }
};
