import express from "express";
import pool from "./db.js";

const router = express.Router();

/**
 * Complete list of 61 database test identities matching full_fictional_dataset.sql
 */
const ALL_61_IDENTITIES = [
    { identity_id: 1, person_id: 1, identity_type: "PHONE", identity_value: "PHONE_TEST_001", source_system: "Demo Mobile System", full_name: "Test Person One" },
    { identity_id: 2, person_id: 1, identity_type: "ABHA", identity_value: "ABHA_TEST_001", source_system: "Demo Health System", full_name: "Test Person One" },
    { identity_id: 3, person_id: 1, identity_type: "AADHAAR", identity_value: "AADHAAR_TEST_001", source_system: "Demo ID System", full_name: "Test Person One" },
    { identity_id: 4, person_id: 2, identity_type: "PHONE", identity_value: "PHONE_TEST_002", source_system: "Demo Mobile System", full_name: "Test Person Two" },
    { identity_id: 5, person_id: 2, identity_type: "DIGILOCKER", identity_value: "DIGILOCKER_TEST_002", source_system: "Demo Document System", full_name: "Test Person Two" },
    { identity_id: 6, person_id: 3, identity_type: "PHONE", identity_value: "PHONE_TEST_003", source_system: "Demo Mobile System", full_name: "Test Person Three" },
    { identity_id: 7, person_id: 3, identity_type: "ABHA", identity_value: "ABHA_TEST_003", source_system: "Demo Health System", full_name: "Test Person Three" },
    { identity_id: 8, person_id: 4, identity_type: "PHONE", identity_value: "PHONE_TEST_004", source_system: "Demo Mobile System", full_name: "Test Person Four" },
    { identity_id: 9, person_id: 4, identity_type: "DIGILOCKER", identity_value: "DIGILOCKER_TEST_004", source_system: "Demo Document System", full_name: "Test Person Four" },
    { identity_id: 10, person_id: 5, identity_type: "PHONE", identity_value: "PHONE_TEST_005", source_system: "Demo Mobile System", full_name: "Test Person Five" },
    { identity_id: 11, person_id: 5, identity_type: "EMAIL", identity_value: "EMAIL_TEST_005", source_system: "Demo Email System", full_name: "Test Person Five" },
    { identity_id: 12, person_id: 6, identity_type: "PHONE", identity_value: "PHONE_TEST_006", source_system: "Demo Mobile System", full_name: "Test Person Six" },
    { identity_id: 13, person_id: 6, identity_type: "ABHA", identity_value: "ABHA_TEST_006", source_system: "Demo Health System", full_name: "Test Person Six" },
    { identity_id: 14, person_id: 7, identity_type: "PHONE", identity_value: "PHONE_TEST_007", source_system: "Demo Mobile System", full_name: "Test Person Seven" },
    { identity_id: 15, person_id: 7, identity_type: "VOTER", identity_value: "VOTER_TEST_007", source_system: "Demo Voter System", full_name: "Test Person Seven" },
    { identity_id: 16, person_id: 8, identity_type: "PHONE", identity_value: "PHONE_TEST_008", source_system: "Demo Mobile System", full_name: "Test Person Eight" },
    { identity_id: 17, person_id: 8, identity_type: "PAN", identity_value: "PAN_TEST_008", source_system: "Demo Tax System", full_name: "Test Person Eight" },
    { identity_id: 18, person_id: 9, identity_type: "PHONE", identity_value: "PHONE_TEST_009", source_system: "Demo Mobile System", full_name: "Test Person Nine" },
    { identity_id: 19, person_id: 9, identity_type: "EMAIL", identity_value: "EMAIL_TEST_009", source_system: "Demo Email System", full_name: "Test Person Nine" },
    { identity_id: 20, person_id: 10, identity_type: "PHONE", identity_value: "PHONE_TEST_010", source_system: "Demo Mobile System", full_name: "Test Person Ten" },
    { identity_id: 21, person_id: 10, identity_type: "ABHA", identity_value: "ABHA_TEST_010", source_system: "Demo Health System", full_name: "Test Person Ten" },
    { identity_id: 22, person_id: 11, identity_type: "PHONE", identity_value: "PHONE_TEST_011", source_system: "Demo Mobile System", full_name: "Test Person Eleven" },
    { identity_id: 23, person_id: 11, identity_type: "DIGILOCKER", identity_value: "DIGILOCKER_TEST_011", source_system: "Demo Document System", full_name: "Test Person Eleven" },
    { identity_id: 24, person_id: 12, identity_type: "PHONE", identity_value: "PHONE_TEST_012", source_system: "Demo Mobile System", full_name: "Test Person Twelve" },
    { identity_id: 25, person_id: 12, identity_type: "ABHA", identity_value: "ABHA_TEST_012", source_system: "Demo Health System", full_name: "Test Person Twelve" },
    { identity_id: 26, person_id: 13, identity_type: "PHONE", identity_value: "PHONE_TEST_013", source_system: "Demo Mobile System", full_name: "Test Person Thirteen" },
    { identity_id: 27, person_id: 13, identity_type: "ABHA", identity_value: "ABHA_TEST_013", source_system: "Demo Health System", full_name: "Test Person Thirteen" },
    { identity_id: 28, person_id: 14, identity_type: "PHONE", identity_value: "PHONE_TEST_014", source_system: "Demo Mobile System", full_name: "Test Person Fourteen" },
    { identity_id: 29, person_id: 14, identity_type: "ABHA", identity_value: "ABHA_TEST_014", source_system: "Demo Health System", full_name: "Test Person Fourteen" },
    { identity_id: 30, person_id: 15, identity_type: "PHONE", identity_value: "PHONE_TEST_015", source_system: "Demo Mobile System", full_name: "Test Person Fifteen" },
    { identity_id: 31, person_id: 15, identity_type: "ABHA", identity_value: "ABHA_TEST_015", source_system: "Demo Health System", full_name: "Test Person Fifteen" },
    { identity_id: 32, person_id: 16, identity_type: "PHONE", identity_value: "PHONE_TEST_016", source_system: "Demo Mobile System", full_name: "Test Person Sixteen" },
    { identity_id: 33, person_id: 16, identity_type: "ABHA", identity_value: "ABHA_TEST_016", source_system: "Demo Health System", full_name: "Test Person Sixteen" },
    { identity_id: 34, person_id: 17, identity_type: "PHONE", identity_value: "PHONE_TEST_017", source_system: "Demo Mobile System", full_name: "Test Person Seventeen" },
    { identity_id: 35, person_id: 17, identity_type: "ABHA", identity_value: "ABHA_TEST_017", source_system: "Demo Health System", full_name: "Test Person Seventeen" },
    { identity_id: 36, person_id: 18, identity_type: "PHONE", identity_value: "PHONE_TEST_018", source_system: "Demo Mobile System", full_name: "Test Person Eighteen" },
    { identity_id: 37, person_id: 18, identity_type: "ABHA", identity_value: "ABHA_TEST_018", source_system: "Demo Health System", full_name: "Test Person Eighteen" },
    { identity_id: 38, person_id: 19, identity_type: "PHONE", identity_value: "PHONE_TEST_019", source_system: "Demo Mobile System", full_name: "Test Person Nineteen" },
    { identity_id: 39, person_id: 19, identity_type: "ABHA", identity_value: "ABHA_TEST_019", source_system: "Demo Health System", full_name: "Test Person Nineteen" },
    { identity_id: 40, person_id: 20, identity_type: "PHONE", identity_value: "PHONE_TEST_020", source_system: "Demo Mobile System", full_name: "Test Person Twenty" },
    { identity_id: 41, person_id: 20, identity_type: "ABHA", identity_value: "ABHA_TEST_020", source_system: "Demo Health System", full_name: "Test Person Twenty" },
    { identity_id: 42, person_id: 21, identity_type: "PHONE", identity_value: "PHONE_TEST_021", source_system: "Demo Mobile System", full_name: "Test Person 21" },
    { identity_id: 43, person_id: 22, identity_type: "PHONE", identity_value: "PHONE_TEST_022", source_system: "Demo Mobile System", full_name: "Test Person 22" },
    { identity_id: 44, person_id: 23, identity_type: "PHONE", identity_value: "PHONE_TEST_023", source_system: "Demo Mobile System", full_name: "Test Person 23" },
    { identity_id: 45, person_id: 24, identity_type: "PHONE", identity_value: "PHONE_TEST_024", source_system: "Demo Mobile System", full_name: "Test Person 24" },
    { identity_id: 46, person_id: 25, identity_type: "PHONE", identity_value: "PHONE_TEST_025", source_system: "Demo Mobile System", full_name: "Test Person 25" },
    { identity_id: 47, person_id: 26, identity_type: "PHONE", identity_value: "PHONE_TEST_026", source_system: "Demo Mobile System", full_name: "Test Person 26" },
    { identity_id: 48, person_id: 27, identity_type: "PHONE", identity_value: "PHONE_TEST_027", source_system: "Demo Mobile System", full_name: "Test Person 27" },
    { identity_id: 49, person_id: 28, identity_type: "PHONE", identity_value: "PHONE_TEST_028", source_system: "Demo Mobile System", full_name: "Test Person 28" },
    { identity_id: 50, person_id: 29, identity_type: "PHONE", identity_value: "PHONE_TEST_029", source_system: "Demo Mobile System", full_name: "Test Person 29" },
    { identity_id: 51, person_id: 30, identity_type: "PHONE", identity_value: "PHONE_TEST_030", source_system: "Demo Mobile System", full_name: "Test Person 30" },
    { identity_id: 52, person_id: 31, identity_type: "PHONE", identity_value: "PHONE_TEST_031", source_system: "Demo Mobile System", full_name: "Test Person 31" },
    { identity_id: 53, person_id: 32, identity_type: "PHONE", identity_value: "PHONE_TEST_032", source_system: "Demo Mobile System", full_name: "Test Person 32" },
    { identity_id: 54, person_id: 33, identity_type: "PHONE", identity_value: "PHONE_TEST_033", source_system: "Demo Mobile System", full_name: "Test Person 33" },
    { identity_id: 55, person_id: 34, identity_type: "PHONE", identity_value: "PHONE_TEST_034", source_system: "Demo Mobile System", full_name: "Test Person 34" },
    { identity_id: 56, person_id: 35, identity_type: "PHONE", identity_value: "PHONE_TEST_035", source_system: "Demo Mobile System", full_name: "Test Person 35" },
    { identity_id: 57, person_id: 36, identity_type: "PHONE", identity_value: "PHONE_TEST_036", source_system: "Demo Mobile System", full_name: "Test Person 36" },
    { identity_id: 58, person_id: 37, identity_type: "PHONE", identity_value: "PHONE_TEST_037", source_system: "Demo Mobile System", full_name: "Test Person 37" },
    { identity_id: 59, person_id: 38, identity_type: "PHONE", identity_value: "PHONE_TEST_038", source_system: "Demo Mobile System", full_name: "Test Person 38" },
    { identity_id: 60, person_id: 39, identity_type: "PHONE", identity_value: "PHONE_TEST_039", source_system: "Demo Mobile System", full_name: "Test Person 39" },
    { identity_id: 61, person_id: 40, identity_type: "AADHAAR", identity_value: "AADHAAR_TEST_999", source_system: "Demo ID System", full_name: "Test Person Forty" }
];

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

        if (rows && rows.length > 0) {
            return res.json({
                success: true,
                count: rows.length,
                identities: rows
            });
        }
    } catch (error) {
        console.warn("Database query skipped for /api/identities, returning complete 61 dataset identities:", error.message);
    }

    res.json({
        success: true,
        count: ALL_61_IDENTITIES.length,
        identities: ALL_61_IDENTITIES
    });
});

export default router;
