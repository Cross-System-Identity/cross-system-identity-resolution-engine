import dotenv from "dotenv";

dotenv.config();

export function authenticate(req, res, next) {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "API key is required"
        });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({
            success: false,
            message: "Invalid API key"
        });
    }

    req.user = {
        role: "admin",
        name: "Module4-Demo-User"
    };

    next();
}