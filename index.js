require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const cors = require("cors")({ origin: true });
const app = express();
const bodyParser = require("body-parser");
// const pool = require("./db");
const originWhitelist = [
  "http://localhost:3000",
  "https://dev.d2fp1mggaiv640.amplifyapp.com/",
  "https://dev.d2fp1mggaiv640.amplifyapp.com",
];

function checkCorsOrigin(origin, callback) {
  if (originWhitelist.indexOf(origin) !== -1 || !origin) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
}

const corss = {
  origin: checkCorsOrigin,
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
  methods: "GET,HEAD,PUT,POST,DELETE,OPTIONS",
};
const port = 8081;
// parse requests of content-type - application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
// app.use(bodyParser.json({ limit: "150mb", extended: true }));

app.use(cors(corss));
app.use(express.json());
//app.use(compression());
// define a simple route
app.get("/", (req, res) => {
  res.json({ message: "Project is running" });
});

app.use(bodyParser.json());

// api routes folder path
require("./routes/openAI.route")(app);
require("./routes/jobs.route")(app);
require("./routes/resume.route")(app);
require("./routes/candidate.route")(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
