const candidateModel = require("../model/candidate.model");
const openAIModel = require("../model/openAI.model");

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await candidateModel.getAllCandidates();

    res.status(200).send({
      data: candidates,
      message: "Candidates fetched successfully.",
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};

exports.processCandidate = async (req, res) => {
  const { email, id, relavant_experiance, job_id } = req.body;
  let questions = null;
  try {
    if (email) {
      const candidateDetails = await candidateModel.getCandidateDetails(email);
      if (candidateDetails.length && candidateDetails[0]?.attempts >= 1) {
        res.status(400).send({
          message: "You already submitted the assessment.",
        });
      } else if (
        candidateDetails.length &&
        candidateDetails[0]?.attempts === 0
      ) {
        // const updateCandidateData = await candidateModel.updateCandidate(
        //   req.body
        // );
        // if (updateCandidateData) {
        questions = await openAIModel.getInterViewQuestions(
          id,
          relavant_experiance,
          job_id
        );
        // }
      } else {
        const addCandidateData = await candidateModel.addCandidate(req.body);
        questions = await openAIModel.getInterViewQuestions(
          id,
          relavant_experiance,
          job_id
        );
      }

      res.status(200).send({
        // data: isAlreadyExist,
        data: questions,
        message: "Questions fetched successfully.",
      });
    } else {
      res.status(400).send({
        message: "Email is Required",
      });
    }
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
};
