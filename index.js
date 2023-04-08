const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
// const pool = require("./db");

const port = 8081;
// parse requests of content-type - application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
// app.use(bodyParser.json({ limit: "150mb", extended: true }));

app.use(cors());
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
