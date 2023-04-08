// Database config file
// this config file postgraseSQL

const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  // password: "SMBS123$",
  password: "1234",
  host: "localhost",
  port: 5432,
  //database: "sample"
  database: "acquirehive",
});

module.exports = pool;
