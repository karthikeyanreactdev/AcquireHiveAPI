const { Configuration, OpenAIApi } = require("openai");
const pool = require("../db");
const jobsModel = require("../model/jobs.model");

const openAIController = require("../controller/openAI.controller");
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

// open ai create job posting based employer input
exports.getJobPostingFormat = async (jobDescriptionPrompt) => {
  const responseData = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: jobDescriptionPrompt.replaceAll("\n", ""),
    temperature: 0.7,
    max_tokens: 600,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  try {
    var jobPostingData = JSON.parse(
      responseData.data?.choices[0]?.text.replaceAll("\n", "")
    );
    console.log(jobPostingData);
    const clientdata = await pool.query(
      "INSERT INTO jobs (position,experience,location,company_name,notice_period,salary,job_description,skills,is_active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [
        jobPostingData.position,
        jobPostingData.experience,
        jobPostingData.location,
        jobPostingData.company_name,
        jobPostingData.notice_period,
        jobPostingData.salary,
        jobPostingData.job_description,
        jobPostingData.technology,
        true,
      ]
    );
    return clientdata.rows;
  } catch (e) {
    return e;
  }
};

// get interview questions for the candidate based on skill and relavant experiance
exports.getInterViewQuestions = async (id, relavant_experiance, job_id) => {
  const jobDetails = await jobsModel.getJobDetails(job_id);
  let level = "fresher";
  if (relavant_experiance >= 1 && relavant_experiance <= 2) {
    level = "beginner";
  } else if (relavant_experiance <= 4) {
    level = "intermediate";
  } else if (relavant_experiance <= 6) {
    level = "advanced";
  } else if (relavant_experiance <= 8) {
    level = "expert";
  }
  if (jobDetails?.length) {
    const questionsPrompt = `give me 10 questions ${jobDetails[0].skills} ${level} level difficult questions with options and answer in JSON format
[{
question:,
options: [
{
  "id":0,
  "answer":
},
{
  "id":1,
  "answer":
},
{
  "id":2,
  "answer":
},
{
  "id":3,
  "answer":
}
],
answer: id
}
]`;

    const responseData = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: questionsPrompt.replaceAll("\n", ""),
      temperature: 0.6,
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    try {
      var jobPostingData = JSON.parse(
        responseData.data?.choices[0]?.text.replaceAll("\n", "")
      );
      return jobPostingData;
    } catch (e) {
      return e;
    }
  }
};

// open ai create mail content for candidates
exports.createMailContent = async (content) => {
  try {
    const responseData = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: content.replaceAll("\n", ""),
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return responseData.data?.choices[0]?.text;
  } catch (err) {
    // console.error(err.message);
    return false;
  }
};
