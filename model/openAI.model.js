const { Configuration, OpenAIApi } = require("openai");
const pool = require("../db");
const openAIController = require("../controller/openAI.controller");
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);
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
    console.log(
      "check 1",
      responseData.data?.choices[0]?.text.replaceAll("\n", "")
    );

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
// exports.client_creation = async (client) => {
//     const clientdata = await pool.query(
//       "INSERT INTO Clients (clientname,email,address1,address2,phonenumber,faxnumber,depositedamount,isactive,isdeleted,createdby,modifiedby,companyimageurl, zipcode,statee,city,transactionid, createddatetime,qbcustomerid,clientid,rechargeamount,minimumbalance) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *",
//       [
//         client.clientname,
//         client.email,
//         client.address,
//         client.address1,
//         client.phoneNumber,
//         client.faxNumber,
//         client.depositedAmount,
//         client.isActive,
//         client.isDeleted,
//         client.createdBy,
//         client.modifiedBy,
//         client.companyImageURL,
//         client.zipcode,
//         client.state,
//         client.city,
//         client.transactionid,
//         client.createdDateTime,
//         client.qbcustomerid,
//         client.clientid,
//         client.rechargeamount,
//         client.minimumbalance,
//       ]
//     );
//     if (clientdata.rows.length) {
//       const trans = await transaction_route.transaction_creation(client);
//     }
//     return clientdata.rows;
//   };
