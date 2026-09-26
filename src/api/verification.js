import express from "express";
import pool from "./db.js";
import { authenticate } from "./auth.js";
import { createAuditLog, ACTION_TYPES, ENTITY_TYPES } from "../audit/logger.js";

const router = express.Router();

router.post("/verify", authenticate, async (req, res) => {
    try {
        const {
            identity_id,
            verification_method = "SIMULATED_PROVIDER"
        } = req.body;

        if (!identity_id) {
            return res.status(400).json({
                success: false,
                message: "identity_id is required"
            });
        }

        // Check whether the identity exists
        const [identities] = await pool.query(
            `SELECT identity_id, verification_status
             FROM identities
             WHERE identity_id = ?`,
            [identity_id]
        );

        if (identities.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Identity not found"
            });
        }

        // Simulated external identity provider
        const verificationResult = "VERIFIED";

        // Store verification record
        const [result] = await pool.query(
            `INSERT INTO verification_records
             (identity_id, verification_method, verification_result, verified_at, remarks)
             VALUES (?, ?, ?, NOW(), ?)`,
            [
                identity_id,
                verification_method,
                verificationResult,
                "Verified using simulated identity provider"
            ]
        );

        // Update current verification status
        await pool.query(
            `UPDATE identities
             SET verification_status = ?
             WHERE identity_id = ?`,
            [verificationResult, identity_id]
        );

        // Module 5 Audit Logging: Record system action into audit_logs table
        await createAuditLog({
            actionType: ACTION_TYPES.IDENTITY_VERIFY,
            entityType: ENTITY_TYPES.IDENTITY,
            entityId: identity_id,
            performedBy: req.user?.name || "API_USER",
            details: {
                verification_id: result.insertId,
                verification_method,
                verification_result: verificationResult
            }
        });

        res.json({
            success: true,
            message: "Identity verification completed",
            verification_id: result.insertId,
            identity_id,
            verification_method,
            verification_result: verificationResult
        });

    } catch (error) {
        console.error("Verification error:", error.message);

        res.status(500).json({
            success: false,
            message: "Verification failed"
        });
    }
});

export default router;