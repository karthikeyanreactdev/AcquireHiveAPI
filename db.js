// Database config file
// this config file postgraseSQL

const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  // password: "SMBS123$",
  password: "1234",
  host: "database-1.c8pok7r318td.eu-north-1.rds.amazonaws.com",
  port: 5432,
  //database: "sample"
  database: "acquirehive",
});

module.exports = pool;
