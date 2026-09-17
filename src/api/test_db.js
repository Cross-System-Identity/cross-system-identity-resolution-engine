import pool from "./db.js";

try {
    const [rows] = await pool.query("SELECT 1 AS test");

    console.log("Database connection successful.");
    console.log(rows);

    await pool.end();
} catch (error) {
    console.error("Database connection failed.");
    console.error(error.message);
}