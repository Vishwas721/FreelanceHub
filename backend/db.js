const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Use promise wrapper so you can use async/await everywhere
const db = pool.promise();

db.getConnection()
  .then(conn => {
    console.log("✅ MySQL pool connected!");
    conn.release();
  })
  .catch(err => {
    console.error("MySQL pool connection failed:", err);
  });

module.exports = db; // ✅ Ensure only this promise-based pool is exported