import {
    createAuditLog,
    getAuditLogs,
    formatAuditLogEntry,
    ACTION_TYPES,
    ENTITY_TYPES
} from "./logger.js";

export {
    createAuditLog,
    getAuditLogs,
    formatAuditLogEntry,
    ACTION_TYPES,
    ENTITY_TYPES
};

/**
 * Module 5 Audit Logging & Compliance Demo Runner
 */
export async function runAuditDemo() {
    console.log("====================================================");
    console.log(" CROSS-SYSTEM IDENTITY RESOLUTION ENGINE            ");
    console.log(" MODULE 5: AUDIT LOGGING & COMPLIANCE DEMO          ");
    console.log("====================================================\n");

    console.log("--- 1. Recording Identity Verification Audit Event ---");
    const verifyLog = await createAuditLog({
        actionType: ACTION_TYPES.IDENTITY_VERIFY,
        entityType: ENTITY_TYPES.IDENTITY,
        entityId: 101,
        performedBy: "Module5-Demo-User",
        details: { verificationMethod: "SIMULATED_PROVIDER", status: "VERIFIED" }
    });
    console.log("Audit Record Created:", verifyLog);
    console.log("\n--- 2. Recording Identity Match Audit Event ---");
    const matchLog = await createAuditLog({
        actionType: ACTION_TYPES.IDENTITY_MATCH,
        entityType: ENTITY_TYPES.IDENTITY_LINK,
        entityId: 202,
        performedBy: "Module5-Demo-User",
        details: { sourceIdentityId: 101, targetIdentityId: 102, matchResult: "CONFIRMED_MATCH", confidenceScore: 98.29 }
    });
    console.log("Audit Record Created:", matchLog);

    console.log("\n--- 3. Recording Authentication Failure Audit Event ---");
    const authLog = await createAuditLog({
        actionType: ACTION_TYPES.AUTH_FAILURE,
        entityType: ENTITY_TYPES.SYSTEM,
        entityId: 0,
        performedBy: "ANONYMOUS",
        details: "Invalid API key attempt from IP 127.0.0.1"
    });
    console.log("Audit Record Created:", authLog);

    console.log("\n--- 4. Formatted Audit Logs ---");
    const logs = [
        { audit_id: verifyLog.auditId || 1, action_type: ACTION_TYPES.IDENTITY_VERIFY, entity_type: ENTITY_TYPES.IDENTITY, entity_id: 101, performed_by: "Module5-Demo-User", action_timestamp: new Date(), details: JSON.stringify({ status: "VERIFIED" }) },
        { audit_id: matchLog.auditId || 2, action_type: ACTION_TYPES.IDENTITY_MATCH, entity_type: ENTITY_TYPES.IDENTITY_LINK, entity_id: 202, performed_by: "Module5-Demo-User", action_timestamp: new Date(), details: JSON.stringify({ matchResult: "CONFIRMED_MATCH", confidenceScore: 98.29 }) },
        { audit_id: authLog.auditId || 3, action_type: ACTION_TYPES.AUTH_FAILURE, entity_type: ENTITY_TYPES.SYSTEM, entity_id: 0, performed_by: "ANONYMOUS", action_timestamp: new Date(), details: "Invalid API key attempt" }
    ];

    logs.forEach(log => {
        console.log(formatAuditLogEntry(log));
    });

    console.log("\n====================================================");
    console.log(" Module 5 Audit Logging & Compliance demo complete. ");
    console.log("====================================================\n");
}

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
    runAuditDemo().catch(err => console.error("Audit demo error:", err));
}
