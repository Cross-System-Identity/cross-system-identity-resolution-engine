import express from "express";
import pool from "./db.js";
import { authenticate } from "./auth.js";
import { resolveIdentity } from "../engine/resolver.js";
import { createAuditLog, ACTION_TYPES, ENTITY_TYPES } from "../audit/logger.js";

const router = express.Router();
const ALLOWED_TYPES = new Set(["PHONE", "ABHA", "AADHAAR", "DIGILOCKER", "EMAIL", "PAN", "VOTER"]);
const TEST_ID_PATTERN = /^[A-Z]+_TEST_[0-9]{3}$/;

router.post("/match", authenticate, async (req, res) => {
    try {
        const sourceType = String(req.body.source_identity_type || "").trim().toUpperCase();
        const sourceValue = String(req.body.source_identity_value || "").trim().toUpperCase();
        const targetType = String(req.body.target_identity_type || "").trim().toUpperCase();
        const targetValue = String(req.body.target_identity_value || "").trim().toUpperCase();

        if (!ALLOWED_TYPES.has(sourceType) || !ALLOWED_TYPES.has(targetType)) {
            return res.status(400).json({ success: false, message: "Choose a supported identity system." });
        }
        if (!TEST_ID_PATTERN.test(sourceValue) || !TEST_ID_PATTERN.test(targetValue) ||
            !sourceValue.startsWith(`${sourceType}_TEST_`) ||
            !targetValue.startsWith(`${targetType}_TEST_`)) {
            return res.status(400).json({
                success: false,
                message: "Use fictional test IDs matching the selected systems, such as PHONE_TEST_001."
            });
        }
        if (sourceType === targetType && sourceValue === targetValue) {
            return res.status(400).json({ success: false, message: "Enter two different identity values." });
        }

        const findIdentity = async (identityType, identityValue) => {
            const [rows] = await pool.query(
                `SELECT i.identity_id, i.person_id, i.identity_type, i.identity_value,
                        p.full_name, p.date_of_birth
                 FROM identities i
                 JOIN persons p ON i.person_id = p.person_id
                 WHERE i.identity_type = ? AND i.identity_value = ?
                 LIMIT 1`,
                [identityType, identityValue]
            );
            return rows[0] || null;
        };

        const [source, target] = await Promise.all([
            findIdentity(sourceType, sourceValue),
            findIdentity(targetType, targetValue)
        ]);
        if (!source || !target) {
            return res.status(404).json({
                success: false,
                message: "One or both fictional test IDs were not found in the demo records."
            });
        }

        // Stored attributes are used internally by the existing resolver; names are not returned or audited.
        const resolution = resolveIdentity(
            {
                identityType: source.identity_type,
                identityValue: source.identity_value,
                personName: source.full_name,
                dateOfBirth: source.date_of_birth
            },
            {
                identityType: target.identity_type,
                identityValue: target.identity_value,
                personName: target.full_name,
                dateOfBirth: target.date_of_birth
            },
            { systemSalt: process.env.SYSTEM_SALT || "SYSTEM_SALT_2026", enableZkp: false }
        );

        const [insertResult] = await pool.query(
            `INSERT INTO identity_links
             (source_identity_id, target_identity_id, link_status, confidence_score, match_reason)
             VALUES (?, ?, ?, ?, ?)`,
            [source.identity_id, target.identity_id, resolution.matchResult,
             resolution.confidenceScore, resolution.description]
        );

        await createAuditLog({
            actionType: ACTION_TYPES.IDENTITY_MATCH,
            entityType: ENTITY_TYPES.IDENTITY_LINK,
            entityId: insertResult.insertId,
            performedBy: req.user?.name || "API_USER",
            details: {
                source_type: source.identity_type,
                target_type: target.identity_type,
                match_result: resolution.matchResult,
                confidence_score: resolution.confidenceScore
            }
        });

        return res.json({
            success: true,
            message: "Identity matching completed",
            match_result: resolution.matchResult,
            confidence_score: resolution.confidenceScore,
            description: resolution.description,
            execution_time_ms: resolution.executionTimeMs
        });
    } catch (error) {
        console.error("Matching error:", error.message);
        return res.status(500).json({ success: false, message: "Identity matching failed" });
    }
});

export default router;
