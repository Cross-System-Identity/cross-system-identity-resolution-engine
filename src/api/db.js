import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = (process.env.MYSQL_URL || process.env.DATABASE_URL)
    ? { uri: process.env.MYSQL_URL || process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
        user: process.env.DB_USER || process.env.MYSQLUSER || "root",
        password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
        database: process.env.DB_NAME || process.env.MYSQLDATABASE || "identity_resolution_db",
        port: Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306
    };

const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;