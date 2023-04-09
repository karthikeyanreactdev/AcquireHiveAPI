const openAIModel = require("../model/openAI.model");

// open ai create job posting based employer input
exports.openAIJobPosting = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (jobDescription != "") {
      const jobDescriptionPrompt =
        jobDescription +
        ` convert this details into JSON Schema refer below schema and create a more detailed job description 
     and primary technology only{
  "position": "",
  "experience": "",
  "required_skill": "",
  "location": "",
  "company_name": "",
  "notice_period": "",
  "salary": "",
    "job_description":"",
    "technology":""
}`;
      const jobPostingResponse = await openAIModel.getJobPostingFormat(
        jobDescriptionPrompt
      );

      res.status(200).send({
        data: jobPostingResponse,
        //   data: dashboardvalues,
        message: "Job Posted Successfully.",
      });
    } else {
      res.status(500).send({
        data: [],
        message: "Please fill Job Description.",
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(422).send({
      // data: [],
      message: err.message,
    });
  }
};
