import express from "express";
import pool from "./db.js";
import { authenticate } from "./auth.js";
import { resolveIdentity } from "../engine/resolver.js";
import { createAuditLog, ACTION_TYPES, ENTITY_TYPES } from "../audit/logger.js";

const router = express.Router();

router.post("/match", authenticate, async (req, res) => {
    try {
        const {
            source_identity_id,
            target_identity_id
        } = req.body;

        // Validate input
        if (!source_identity_id || !target_identity_id) {
            return res.status(400).json({
                success: false,
                message: "source_identity_id and target_identity_id are required"
            });
        }

        if (source_identity_id === target_identity_id) {
            return res.status(400).json({
                success: false,
                message: "Source and target identities must be different"
            });
        }

        // Fetch both identity records and their person information
        const [rows] = await pool.query(
            `SELECT
                i.identity_id,
                i.person_id,
                i.identity_type,
                i.identity_value,
                i.source_system,
                p.full_name,
                p.date_of_birth
             FROM identities i
             JOIN persons p ON i.person_id = p.person_id
             WHERE i.identity_id IN (?, ?)`,
            [source_identity_id, target_identity_id]
        );

        if (rows.length !== 2) {
            return res.status(404).json({
                success: false,
                message: "One or both identities were not found"
            });
        }

        const source = rows.find(
            row => row.identity_id === Number(source_identity_id)
        );

        const target = rows.find(
            row => row.identity_id === Number(target_identity_id)
        );

        // Convert database records to Module 3 resolver format
        const recordA = {
            identityType: source.identity_type,
            identityValue: source.identity_value,
            personName: source.full_name,
            dateOfBirth: source.date_of_birth,
            secretForZkp: `ZKP_SECRET_PERSON_${source.person_id}`
        };

        const recordB = {
            identityType: target.identity_type,
            identityValue: target.identity_value,
            personName: target.full_name,
            dateOfBirth: target.date_of_birth,
            secretForZkp: `ZKP_SECRET_PERSON_${target.person_id}`
        };

        // Reuse Module 3 Identity Resolution Engine
        const resolution = resolveIdentity(recordA, recordB, {
            systemSalt: process.env.SYSTEM_SALT || "SYSTEM_SALT_2026",
            enableZkp: Boolean(req.body.enable_zkp || req.body.enableZkp)
        });

        // Store the matching result in identity_links
        const [insertResult] = await pool.query(
            `INSERT INTO identity_links
             (source_identity_id, target_identity_id, link_status,
              confidence_score, match_reason)
             VALUES (?, ?, ?, ?, ?)`,
            [
                source_identity_id,
                target_identity_id,
                resolution.matchResult,
                resolution.confidenceScore,
                resolution.description
            ]
        );

        // Module 5 Audit Logging: Record system action into audit_logs table
        await createAuditLog({
            actionType: ACTION_TYPES.IDENTITY_MATCH,
            entityType: ENTITY_TYPES.IDENTITY_LINK,
            entityId: insertResult.insertId,
            performedBy: req.user?.name || "API_USER",
            details: {
                source_identity_id,
                target_identity_id,
                match_result: resolution.matchResult,
                confidence_score: resolution.confidenceScore
            }
        });

        // Return privacy-preserving result
        res.json({
            success: true,
            message: "Identity matching completed",
            link_id: insertResult.insertId,
            source_identity_id,
            target_identity_id,
            match_result: resolution.matchResult,
            confidence_score: resolution.confidenceScore,
            description: resolution.description,
            execution_time_ms: resolution.executionTimeMs,
            scoring: resolution.scoring
        });

    } catch (error) {
        console.error("Matching error:", error.message);

        res.status(500).json({
            success: false,
            message: "Identity matching failed"
        });
    }
});

export default router;