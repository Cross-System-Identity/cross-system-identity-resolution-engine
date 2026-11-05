﻿﻿import express from "express";
import dotenv from "dotenv";
import { authenticate } from "./auth.js";
import verificationRouter from "./verification.js";
import matchingRouter from "./matching.js";
import auditRouter from "./audit.js";
import identitiesRouter from "./identities.js";
import { initializeDatabase } from "./initDb.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/api", verificationRouter);
app.use("/api", matchingRouter);
app.use("/api", auditRouter);
app.use("/api", identitiesRouter);

app.get("/api/protected", authenticate, (req, res) => {
    res.json({
        success: true,
        message: "Access granted",
        user: req.user
    });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Cross-System Identity Resolution Engine API & Web Dashboard are running",
        modules: ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5", "Module 6"]
    });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
    initializeDatabase().catch(err => console.error("Database initialization error:", err.message));
});