const candidateModel = require("../model/candidate.model");
const openAIModel = require("../model/openAI.model");
var nodemailer = require("nodemailer");

//get all enrolled candidates
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
//proccess candidate based on given data
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
        const updateCandidateData = await candidateModel.updateCandidate(
          req.body
        );
        if (updateCandidateData) {
          questions = await openAIModel.getInterViewQuestions(
            id,
            relavant_experiance,
            job_id
          );
        }
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

exports.sendStatusMail = async (req, res) => {
  const { fullName, email, status } = req.body;
  let subjectContent = "";
  let promptContent = "";
  if (status === "next_level") {
    subjectContent = "Second Level Interview Letter";
    promptContent = `generate Second Level Interview schedule Letter, Company name: Instrive Softlabs, Location: chennai, employee name: ${fullName}, Start date: 06th April 2023,designation: software developer, Thanks Ashok kannadasan, CEO - Cofounder`;
  } else if (status === "give_offer") {
    subjectContent = "Offer Interview Letter";
    promptContent = `generate offer letter, Company name: Instrive Softlabs, Location: chennai, employee name: ${fullName}, Start date: 06th April 2023, designation: software developer, Salary offer: Rs.500000, Thanks Ashok kannadasan, CEO - Cofounder`;
  } else if (status === "unsuccessfull") {
    subjectContent = "Unsuccessfull application Letter";
    promptContent = `generate Unsuccessfull application Letter, Company name: Instrive Softlabs, Location: chennai, employee name: ${fullName},  Thanks Ashok kannadasan, CEO - Cofounder`;
  }
  const content = await openAIModel.createMailContent(promptContent);
  if (content) {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    var mailOptions = {
      from: "acquirehive@gmail.com",
      to: email,
      subject: subjectContent,
      text: content,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(400).send({
          message: "Error occured.",
        });
      } else {
        res.status(200).send({
          message: "Email sent successfully..",
        });
      }
    });
  } else {
    res.status(400).send({
      message: "Error occured.",
    });
  }
};
