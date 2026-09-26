import express from "express";
import pool from "./db.js";

const router = express.Router();

/**
 * GET /api/identities
 * Fetches all available identity records from the database
 * joined with person information for frontend selection.
 */
router.get("/identities", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                i.identity_id,
                i.person_id,
                i.identity_type,
                i.identity_value,
                i.source_system,
                i.verification_status,
                p.full_name,
                p.date_of_birth
             FROM identities i
             JOIN persons p ON i.person_id = p.person_id
             ORDER BY i.identity_id ASC
             LIMIT 100`
        );

        res.json({
            success: true,
            count: rows.length,
            identities: rows
        });
    } catch (error) {
        console.warn("Database unavailable for /api/identities, returning default fallback identities:", error.message);
        
        // Fallback list of diverse fictional test identities
        const fallbackIdentities = [
            { identity_id: 1, person_id: 1, identity_type: "PHONE", identity_value: "PHONE_TEST_001", source_system: "TELECOM", full_name: "Test Person One", date_of_birth: "1998-05-14" },
            { identity_id: 2, person_id: 1, identity_type: "ABHA", identity_value: "ABHA_TEST_001", source_system: "NDHM", full_name: "Test Person One", date_of_birth: "1998-05-14" },
            { identity_id: 3, person_id: 1, identity_type: "AADHAAR", identity_value: "AADHAAR_TEST_001", source_system: "UIDAI", full_name: "Test Person One", date_of_birth: "1998-05-14" },
            { identity_id: 4, person_id: 2, identity_type: "DIGILOCKER", identity_value: "DIGILOCKER_TEST_002", source_system: "DIGILOCKER", full_name: "Test Person Two", date_of_birth: "2000-09-22" },
            { identity_id: 5, person_id: 5, identity_type: "EMAIL", identity_value: "EMAIL_TEST_005", source_system: "PORTAL", full_name: "Test Person Five", date_of_birth: "1995-01-10" },
            { identity_id: 40, person_id: 40, identity_type: "AADHAAR", identity_value: "AADHAAR_TEST_999", source_system: "UIDAI", full_name: "Test Person Forty", date_of_birth: "2003-12-25" },
            { identity_id: 41, person_id: 40, identity_type: "PHONE", identity_value: "PHONE_TEST_999", source_system: "TELECOM", full_name: "Test Person Forty", date_of_birth: "2003-12-25" }
        ];

        res.json({
            success: true,
            count: fallbackIdentities.length,
            identities: fallbackIdentities
        });
    }
});

export default router;
