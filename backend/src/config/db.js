const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config(); 
console.log(process.env.DB_HOST)

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();

module.exports = pool;