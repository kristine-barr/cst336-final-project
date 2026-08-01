import mysql from "mysql2/promise";

// setting up database connection pool
// This are populated from the values in the .env file.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
});

export default pool;