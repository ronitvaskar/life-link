const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

pool
  .getConnection()
  .then((connection) => {
    console.log("==============================================");
    console.log("       LIFE LINK DATABASE CONNECTION");
    console.log("==============================================");
    console.log("Database : Connected");
    console.log(`Host     : ${process.env.DB_HOST}`);
    console.log(`Port     : ${process.env.DB_PORT || 3306}`);
    console.log(`Database : ${process.env.DB_NAME}`);
    console.log("SSL      : Enabled");
    console.log("==============================================");

    connection.release();
  })
  .catch((error) => {
    console.error("==============================================");
    console.error("       LIFE LINK DATABASE ERROR");
    console.error("==============================================");
    console.error("Database connection failed.");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("==============================================");
  });

module.exports = pool;