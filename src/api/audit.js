import express from "express";
import { authenticate } from "./auth.js";
import { getAuditLogs, formatAuditLogEntry } from "../audit/logger.js";

const router = express.Router();

/**
 * GET /api/audit-logs
 * Retrieves system audit logs for compliance monitoring and audit dashboard display.
 * Secured via x-api-key header authentication.
 */
router.get("/audit-logs", authenticate, async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 50;
        const offset = req.query.offset ? Number(req.query.offset) : 0;
        const actionType = req.query.action_type || req.query.actionType || null;
        const entityType = req.query.entity_type || req.query.entityType || null;

        const logs = await getAuditLogs({
            limit,
            offset,
            actionType,
            entityType
        });

        const formattedLogs = logs.map(log => ({
            ...log,
            formattedSummary: formatAuditLogEntry(log)
        }));

        res.json({
            success: true,
            count: logs.length,
            limit,
            offset,
            logs: formattedLogs
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve audit logs"
        });
    }
});

export default router;
