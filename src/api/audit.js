import express from "express";
import { authenticate } from "./auth.js";
import { getAuditLogs, formatAuditLogEntry, clearAuditLogsExceptLatest, truncateAuditLogs } from "../audit/logger.js";

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

/**
 * DELETE /api/audit-logs
 * Truncates the entire audit_logs table and resets AUTO_INCREMENT to 1.
 * All new logs recorded after this will start numbering from #1.
 */
router.delete("/audit-logs", authenticate, async (req, res) => {
    try {
        await truncateAuditLogs();
        res.json({
            success: true,
            message: "All audit logs deleted. AUTO_INCREMENT reset to 1. Recording starts fresh.",
            logs: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to truncate audit logs"
        });
    }
});

export default router;
