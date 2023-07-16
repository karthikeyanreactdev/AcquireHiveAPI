const openAIModel = require("../model/openAI.model");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);
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
exports.generate2 = async (req, res) => {
  const response = openai.createChatCompletion(
    {
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "system",
          content: "You are an SEO expert.",
        },
        {
          role: "user",
          content: "Write a paragraph about no-code tools to build in 2021.",
        },
      ],
    },
    { responseType: "stream" }
  );

  console.log(response);

  response.then((resp) => {
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
};
exports.generate = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const reqText = [
      {
        address_line_one: "12, Murugappa Rd",
        address_line_two:
          " Chitra Nagar, Kotturpuram  Chennai, Tamil Nadu 600085",
        city: "Chennai",
        company_name: "Instrive Softlabs Private limited",
        country: "India",
        created: "2023-07-16T03:09:37.791Z",
        experience_from: 0,
        experience_to: 8,

        job_category: "Information Technology (IT)",
        job_sub_category: "Software Developer/Engineer",
        job_title: "Need a full stack web developer",
        job_type: "permanent",

        location:
          "Instrive Softlabs Private limited, Murugappa Road, Chitra Nagar, Kotturpuram, Chennai, Tamil Nadu, India",
        notice_period: "15 Days",
        postal_code: "600085",
        recruiterDetails: { website: "grameya.com", about_us: "asdadaf adad" },
        salary_from: 0,
        salary_to: 12,

        skills: [
          "redux",
          "React",
          "firebase",
          "redux-saga",
          "MongoDB",
          "express",
          "Node.js",
        ],
        state: "Tamil Nadu",
        status: "active",
      },
    ];
    const requiredFormat = `
You are JDbuilderGPT. You need to build Job Descriptions based on a combination of the following 

1. Job Title
2. Tob tagline
3. Technical Skills
4. Soft Skills 
5. Experience 
6. Education 
7.salary

The output JD you generate must be of a very specific HTML format and structure. Use below HTML syntax only for formatting. Do not use any other syntax.


Ensure you perform a grammar and spell check on all contents.


Use a bulleted list and ensure job location and type are clearly mentioned in the candidate profile. 


Provide at least 7 points for key responsibilities, 7 points for desired candidate profile and 5 points for good to have.


HTML JD Structure and format


<h3>Job Description</h3>

<p></p>

<h3>Role Summary</h3>

<ul>

<li></li>

</ul>
<h3>Qualifications and Skills</h3>

<ul>

<li></li>

</ul>


<h3>Duties and Responsibilities</h3>

<ul>

<li></li>

</ul>


<h3>Good to have</h3>

<ul>

<li></li>

</ul>
`;
    const jobDescriptionPrompt =
      requiredFormat +
      "Create a JD based on the following JSON Data. Use the HTML reference format provided. " +
      JSON.stringify(reqText);
    // "Your are a best content GPT. Based on the above JSON details create a job description in 250 words like a expert with bulletins and it must have roles and responsibilites, key skills, company info. Consider experiance in Years and Salary in Lakhs per annum";

    const response = openai.createCompletion(
      {
        model: "text-davinci-003",
        stream: true,
        prompt: jobDescriptionPrompt,
        // "Genarate hello word and some message not more than 10 words inhtml use only use p tag",
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },

      { responseType: "stream" }
    );

    console.log(response);

    response.then((resp) => {
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
              const text = data.choices[0].text;
              // const text = data.choices[0].delta?.content;
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
  } catch (err) {
    console.error("Here +" + err.message);
    res.status(422).send({
      // data: [],
      message: err.message,
    });
  }
};
