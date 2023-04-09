const jobsModel = require("../model/jobs.model");
// const PDFExtract = require("pdf.js-extract").PDFExtract;
const { Configuration, OpenAIApi } = require("openai");
// const fs = require("fs");
const fs = require("fs");
const { createCanvas } = require("canvas");
const pdfjsLib = require("pdfjs-dist");
const pdfjs = require("pdfjs-dist/legacy/build/pdf");
// const pdfjs = require("pdfjs-dist/legacy/build/pdf");
var multer = require("multer");
const pdfParse = require("pdf-parse");
const ReadText = require("text-from-image");
const fmt2json = require("format-to-json");

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);
var dir = null;
var fileName = "";

//handle file i.e store in local and then read
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    dir = "./tmp";
    console.log("1", fs.existsSync(dir));

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log("2", fs.existsSync(dir));
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  },
});
//get a file using key
var upload = multer({
  storage: storage,
}).single("file");

// getting resume raw data and process with open ai and give valid json data
exports.getResumeContent = async (req, res) => {
  var file = "";
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(501).json(err);
    } else if (err) {
      return res.status(501).json(err);
    }
    file = req.file;
    try {
      //var result = await pdfParse(dir + "/" + fileName);
      const data = new Uint8Array(fs.readFileSync(dir + "/" + fileName));
      const pdfDoc = await pdfjsLib.getDocument({ data }).promise;

      // Convert each page to image base64
      const imgDataList = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.3 });
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext("2d");
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        const imgDataUrl = canvas.toDataURL("image/png");
        const imgData = imgDataUrl.replace(/^data:image\/png;base64,/, "");
        imgDataList.push({ imgData: imgData, imgDataUrl: imgDataUrl });
      }
      var result = await ReadText(imgDataList[0].imgDataUrl);
      if (result) {
        var pdfData = result.replaceAll("\n", " ");
        // .replace(/[^a-zA-Z0-9 ]/g, "")
        // .replace(/\s\s+/g, " ")
        // .replace(/  +/g, " ");
        console.log(pdfData.length);

        let chunks = [];
        let startIndex = 0;
        const MAX_TOKENS = 3000;
        var conversationId = "";
        // Split prompt into chunks of MAX_TOKENS or less
        while (startIndex < pdfData.length) {
          let chunk = pdfData.slice(startIndex, startIndex + MAX_TOKENS);
          chunks.push(chunk);
          startIndex += chunk.length;
        }
        var query = ` try to get name, contact info, skills, total year of experiance in numbers, i need response in  in JSON  format
        must include all fileds in response from this text
        {
        "fullName":"",
        "mobile":"",
        "email": "",
        "skills": [],
        "total_years_of_experiance":"",           
        }`;

        let completions = [];

        // Send each chunk to the API and save the generated completion
        for (let i = 0; i < chunks.length; i++) {
          const prom = chunks[i] + query;
          let response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prom,
            temperature: 0.5,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });

          if (response.data?.choices[0]?.text !== "") {
            completions.push(
              response.data?.choices[0]?.text.replaceAll("\n", "")
            );
          }
        }
        let response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt:
            completions +
            query +
            "avoid duplicate and give me single JSON schema",
          temperature: 0.6,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });
        const data = fmt2json(
          response.data?.choices[0]?.text.replaceAll("\n", ""),
          { withDetails: true }
        );
        res.status(200).send({
          data: JSON.parse(
            data.result.replaceAll("\n", "").replaceAll("\r", "")
          ),
          message: "Resume proccessed successfully.",
        });
      }
    } catch (err) {
      res.status(400).send({
        message: err.message,
      });
    }
  });
};
