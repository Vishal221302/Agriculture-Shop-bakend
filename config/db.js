const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

const promisePool = pool.promise();

promisePool.getConnection()
  .then(connection => {
    console.log('MySQL Connected');
    connection.release();
  })
  .catch(err => {
    console.error('MySQL Connection Error:', err.message);
  });

module.exports = promisePool;

