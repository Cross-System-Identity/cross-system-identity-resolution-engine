import { describe, test } from "node:test";
import assert from "node:assert";
import {
    createAuditLog,
    formatAuditLogEntry,
    ACTION_TYPES,
    ENTITY_TYPES
} from "../src/audit/logger.js";

describe("Module 5: Audit Logging & Compliance Unit Tests", () => {

    describe("Constants & Configuration", () => {
        test("ACTION_TYPES exposes expected action names", () => {
            assert.strictEqual(ACTION_TYPES.IDENTITY_VERIFY, "IDENTITY_VERIFY");
            assert.strictEqual(ACTION_TYPES.IDENTITY_MATCH, "IDENTITY_MATCH");
            assert.strictEqual(ACTION_TYPES.AUTH_SUCCESS, "AUTH_SUCCESS");
            assert.strictEqual(ACTION_TYPES.AUTH_FAILURE, "AUTH_FAILURE");
        });

        test("ENTITY_TYPES exposes expected entity names", () => {
            assert.strictEqual(ENTITY_TYPES.IDENTITY, "IDENTITY");
            assert.strictEqual(ENTITY_TYPES.IDENTITY_LINK, "IDENTITY_LINK");
            assert.strictEqual(ENTITY_TYPES.SYSTEM, "SYSTEM");
        });
    });

    describe("Audit Log Formatting", () => {
        test("formatAuditLogEntry builds formatted summary string", () => {
            const sampleLog = {
                audit_id: 101,
                action_type: "IDENTITY_MATCH",
                entity_type: "IDENTITY_LINK",
                entity_id: 5,
                performed_by: "AdminUser",
                action_timestamp: "2026-09-26T12:00:00.000Z",
                details: '{"matchResult":"CONFIRMED_MATCH"}'
            };

            const summary = formatAuditLogEntry(sampleLog);
            assert.ok(typeof summary === "string");
            assert.ok(summary.includes("AUDIT #101"));
            assert.ok(summary.includes("IDENTITY_MATCH"));
            assert.ok(summary.includes("AdminUser"));
            assert.ok(summary.includes("IDENTITY_LINK:5"));
        });
    });

    describe("Audit Creation Validation", () => {
        test("createAuditLog throws error if actionType or entityType is missing", async () => {
            await assert.rejects(
                async () => {
                    await createAuditLog({ entityType: "IDENTITY" });
                },
                {
                    name: "Error",
                    message: "actionType and entityType are required for audit logging."
                }
            );

            await assert.rejects(
                async () => {
                    await createAuditLog({ actionType: "IDENTITY_VERIFY" });
                },
                {
                    name: "Error",
                    message: "actionType and entityType are required for audit logging."
                }
            );
        });
    });
});
