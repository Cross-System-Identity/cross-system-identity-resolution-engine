import pool from "../api/db.js";

/**
 * Module 5: Audit Logging & Compliance Module
 * Provides centralized audit log recording and compliance tracking
 * targeting the audit_logs database table.
 */

/**
 * Standard Action Types for Audit Logging
 */
export const ACTION_TYPES = {
    IDENTITY_VERIFY: "IDENTITY_VERIFY",
    IDENTITY_MATCH: "IDENTITY_MATCH",
    AUTH_SUCCESS: "AUTH_SUCCESS",
    AUTH_FAILURE: "AUTH_FAILURE",
    SYSTEM_EVENT: "SYSTEM_EVENT"
};

/**
 * Standard Entity Types for Audit Logging
 */
export const ENTITY_TYPES = {
    IDENTITY: "IDENTITY",
    IDENTITY_LINK: "IDENTITY_LINK",
    VERIFICATION_RECORD: "VERIFICATION_RECORD",
    SYSTEM: "SYSTEM"
};

/**
 * Writes an audit event entry directly to the audit_logs database table.
 *
 * @param {object} params
 * @param {string} params.actionType - Action name (e.g. IDENTITY_MATCH, IDENTITY_VERIFY)
 * @param {string} params.entityType - Target entity type (e.g. IDENTITY_LINK, IDENTITY)
 * @param {number} [params.entityId=0] - Primary key ID of the affected entity
 * @param {string} [params.performedBy='SYSTEM'] - Identifier of user or service performing action
 * @param {object|string} [params.details=''] - Additional details or metadata object
 * @returns {Promise<object>} Insert result metadata
 */
export async function createAuditLog({
    actionType,
    entityType,
    entityId = 0,
    performedBy = "SYSTEM",
    details = ""
}) {
    if (!actionType || !entityType) {
        throw new Error("actionType and entityType are required for audit logging.");
    }

    const detailString = typeof details === "object" ? JSON.stringify(details) : String(details);

    try {
        const [result] = await pool.query(
            `INSERT INTO audit_logs
             (action_type, entity_type, entity_id, performed_by, action_timestamp, details)
             VALUES (?, ?, ?, ?, NOW(), ?)`,
            [actionType, entityType, Number(entityId), performedBy, detailString]
        );

        return {
            success: true,
            auditId: result.insertId,
            actionType,
            entityType,
            entityId,
            performedBy,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Failed to write to audit_logs table:", error.message);
        // Fallback result so main API flow is not blocked if database is unavailable
        return {
            success: false,
            error: error.message,
            actionType,
            entityType,
            entityId,
            performedBy,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Retrieves audit logs from the database with pagination and optional filtering.
 *
 * @param {object} [options]
 * @param {number} [options.limit=50] - Maximum records to return
 * @param {number} [options.offset=0] - Offset for pagination
 * @param {string} [options.actionType] - Optional filter by action type
 * @param {string} [options.entityType] - Optional filter by entity type
 * @returns {Promise<Array<object>>} List of audit log records
 */
export async function getAuditLogs(options = {}) {
    const limit = Math.max(1, Math.min(Number(options.limit) || 50, 1000));
    const offset = Math.max(0, Number(options.offset) || 0);

    let query = `SELECT audit_id, action_type, entity_type, entity_id, performed_by, action_timestamp, details
                 FROM audit_logs`;
    const params = [];
    const conditions = [];

    if (options.actionType) {
        conditions.push("action_type = ?");
        params.push(options.actionType);
    }

    if (options.entityType) {
        conditions.push("entity_type = ?");
        params.push(options.entityType);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY audit_id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    try {
        const [rows] = await pool.query(query, params);
        return rows;
    } catch (error) {
        console.error("Failed to fetch audit_logs:", error.message);
        return [];
    }
}

/**
 * Deletes all audit logs from the database except the single latest one.
 */
export async function clearAuditLogsExceptLatest() {
    try {
        await pool.query(
            `DELETE FROM audit_logs
             WHERE audit_id NOT IN (
                 SELECT max_id FROM (SELECT MAX(audit_id) AS max_id FROM audit_logs) AS t
             )`
        );
        return { success: true };
    } catch (error) {
        console.warn("Could not delete older audit_logs from database:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Truncates the entire audit_logs table and resets AUTO_INCREMENT to 1.
 * Use this to wipe all past logs and start fresh numbering from #1.
 */
export async function truncateAuditLogs() {
    try {
        await pool.query(`TRUNCATE TABLE audit_logs`);
        return { success: true };
    } catch (error) {
        console.warn("Could not truncate audit_logs:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Formats a single audit log entry for console or UI display.
 *
 * @param {object} log - Audit log record
 * @returns {string} Formatted log summary string
 */
export function formatAuditLogEntry(log) {
    const timestamp = log.action_timestamp ? new Date(log.action_timestamp).toISOString() : new Date().toISOString();
    return `[AUDIT #${log.audit_id || 'N/A'}] ${timestamp} | ${log.action_type} | Entity: ${log.entity_type}:${log.entity_id} | User: ${log.performed_by} | Details: ${log.details || 'N/A'}`;
}
