const candidateModel = require("../model/candidate.model");

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await candidateModel.getAllCandidates();

    res.status(200).send({
      status: true,
      data: candidates,
      message: "Candidates fetched successfully.",
    });
  } catch (err) {
    res.status(400).send({
      status: true,
      message: err.message,
    });
  }
};
