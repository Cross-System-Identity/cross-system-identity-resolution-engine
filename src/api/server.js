import express from "express";
import dotenv from "dotenv";
import { authenticate } from "./auth.js";
import verificationRouter from "./verification.js";
import matchingRouter from "./matching.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.use("/api", verificationRouter);
app.use("/api", matchingRouter);
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
        message: "Cross-System Identity Resolution API is running",
        module: "Module 4"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
});