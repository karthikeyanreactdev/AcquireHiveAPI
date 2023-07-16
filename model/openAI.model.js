const { Configuration, OpenAIApi } = require("openai");
const pool = require("../db");
const jobsModel = require("../model/jobs.model");
const fmt2json = require("format-to-json");
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
  console.log(jobDetails);
  let level = "fresher";
  if (relavant_experiance >= 1 && relavant_experiance <= 2) {
    level = "beginner";
  } else if (relavant_experiance <= 4) {
    level = "intermediate";
  } else if (relavant_experiance <= 6) {
    level = "advanced";
  } else if (relavant_experiance >= 6) {
    level = "expert";
  }
  if (jobDetails?.length) {
    const questionsPrompt = `give me 10 questions ${jobDetails[0].skills} ${level} level difficult questions with options and answer in Best JSON format  that can JSON.parse easily
[{
question:"",
options: [
{
  "id":"a",
  "answer":""
},
{
  "id":"b",
  "answer":""
},
{
  "id":"c",
  "answer":""
},
{
  "id":"d",
  "answer":""
}
],
"answer": "id"
}
]`;

    const responseData = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: questionsPrompt.replaceAll("\n", ""),
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    try {
      console.log(responseData.data?.choices[0]?.text.replaceAll("\n", ""));
      const jobPostingData = fmt2json(
        responseData.data?.choices[0]?.text.replaceAll("\n", ""),
        { withDetails: true }
      );
      // var jobPostingData = JSON.parse(
      //   responseData.data?.choices[0]?.text.replaceAll("\n", "")
      // );
      // const parsedData = JSON.parse(jobPostingData.result.replaceAll("\n", ""));
      return JSON.parse(
        jobPostingData.result.replaceAll("\n", "").replaceAll("\r", "")
      );
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

// open ai create job posting based employer input
exports.getJD = async (jobDescriptionPrompt, res) => {
  const responseData = await openai.createCompletion(
    {
      model: "text-davinci-003",
      stream: true,
      prompt: jobDescriptionPrompt,
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },

    { responseType: "stream" }
  );
  // console.log("responseData", responseData.data?.choices[0]?.text);
  try {
    // var jobPostingData = JSON.parse(
    //   responseData.data?.choices[0]?.text.replaceAll("\n", "")
    // );
    // console.log(jobPostingData);
    responseData.then((resp) => {
      resp.data.on("data", (chunk) => {
        // console.log the buffer value
        console.log("chunk: ", chunk);

        // this converts the buffer to a string
        const payloads = chunk.toString().split("\n\n");

        console.log("payloads: ", payloads);

        for (const payload of payloads) {
          // if string includes '[DONE]'
          if (payload.includes("[DONE]")) {
            res.end(); // Close the connection and return
            return;
          }
          if (payload.startsWith("data:")) {
            // remove 'data: ' and parse the corresponding object
            const data = JSON.parse(payload.replace("data: ", ""));
            try {
              const text = data.choices[0].delta?.content;
              if (text) {
                console.log("text: ", text);
                // send value of text to the client
                res.write(`${text}`);
              }
            } catch (error) {
              console.log(`Error with JSON.parse and ${payload}.\n${error}`);
            }
          }
        }
      });
    });
    // return responseData.data?.choices[0]?.text;
  } catch (e) {
    return e;
  }
};
