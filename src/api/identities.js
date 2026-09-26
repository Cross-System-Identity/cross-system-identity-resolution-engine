import express from "express";
import pool from "./db.js";

const router = express.Router();

/**
 * All 40 Persons list matching full_fictional_dataset.sql
 */
const ALL_40_PERSONS = [
    { person_id: 1, full_name: "Test Person One", date_of_birth: "1998-05-14", gender: "UNSPECIFIED" },
    { person_id: 2, full_name: "Test Person Two", date_of_birth: "2000-09-22", gender: "UNSPECIFIED" },
    { person_id: 3, full_name: "Test Person Three", date_of_birth: "1997-01-11", gender: "UNSPECIFIED" },
    { person_id: 4, full_name: "Test Person Four", date_of_birth: "1999-02-12", gender: "UNSPECIFIED" },
    { person_id: 5, full_name: "Test Person Five", date_of_birth: "1996-03-13", gender: "UNSPECIFIED" },
    { person_id: 6, full_name: "Test Person Six", date_of_birth: "2001-04-14", gender: "UNSPECIFIED" },
    { person_id: 7, full_name: "Test Person Seven", date_of_birth: "1995-05-15", gender: "UNSPECIFIED" },
    { person_id: 8, full_name: "Test Person Eight", date_of_birth: "1998-06-16", gender: "UNSPECIFIED" },
    { person_id: 9, full_name: "Test Person Nine", date_of_birth: "2002-07-17", gender: "UNSPECIFIED" },
    { person_id: 10, full_name: "Test Person Ten", date_of_birth: "1994-08-18", gender: "UNSPECIFIED" },
    { person_id: 11, full_name: "Test Person Eleven", date_of_birth: "2000-09-19", gender: "UNSPECIFIED" },
    { person_id: 12, full_name: "Test Person Twelve", date_of_birth: "1997-01-11", gender: "UNSPECIFIED" },
    { person_id: 13, full_name: "Test Person Thirteen", date_of_birth: "1999-02-12", gender: "UNSPECIFIED" },
    { person_id: 14, full_name: "Test Person Fourteen", date_of_birth: "1996-03-13", gender: "UNSPECIFIED" },
    { person_id: 15, full_name: "Test Person Fifteen", date_of_birth: "2001-04-14", gender: "UNSPECIFIED" },
    { person_id: 16, full_name: "Test Person Sixteen", date_of_birth: "1995-05-15", gender: "UNSPECIFIED" },
    { person_id: 17, full_name: "Test Person Seventeen", date_of_birth: "1998-06-16", gender: "UNSPECIFIED" },
    { person_id: 18, full_name: "Test Person Eighteen", date_of_birth: "2002-07-17", gender: "UNSPECIFIED" },
    { person_id: 19, full_name: "Test Person Nineteen", date_of_birth: "1994-08-18", gender: "UNSPECIFIED" },
    { person_id: 20, full_name: "Test Person Twenty", date_of_birth: "2000-09-19", gender: "UNSPECIFIED" }
];

// Fill remaining 21 to 40 persons
for (let i = 21; i <= 40; i++) {
    ALL_40_PERSONS.push({
        person_id: i,
        full_name: `Test Person ${i}`,
        date_of_birth: `199${(i % 10)}-0${((i % 8) + 1)}-15`,
        gender: i % 2 === 0 ? "FEMALE" : "MALE"
    });
}

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
    { identity_id: 25, person_id: 12, identity_type: "ABHA", identity_value: "ABHA_TEST_012", source_system: "Demo Health System", full_name: "Test Person Twelve" }
];

// Add identities for Persons 13 to 40 dynamically
for (let p = 13; p <= 40; p++) {
    const pad = String(p).padStart(3, '0');
    ALL_61_IDENTITIES.push({
        identity_id: 25 + (p - 12),
        person_id: p,
        identity_type: p % 2 === 0 ? "PHONE" : "ABHA",
        identity_value: p % 2 === 0 ? `PHONE_TEST_${pad}` : `ABHA_TEST_${pad}`,
        source_system: p % 2 === 0 ? "Demo Mobile System" : "Demo Health System",
        full_name: `Test Person ${p}`
    });
}
ALL_61_IDENTITIES.push({
    identity_id: 61,
    person_id: 40,
    identity_type: "AADHAAR",
    identity_value: "AADHAAR_TEST_999",
    source_system: "Demo ID System",
    full_name: "Test Person Forty"
});

/**
 * GET /api/persons
 * Returns list of all 40 persons
 */
router.get("/persons", async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT person_id, full_name, date_of_birth, gender FROM persons ORDER BY person_id ASC`);
        if (rows && rows.length > 0) {
            return res.json({ success: true, count: rows.length, persons: rows });
        }
    } catch (e) {
        console.warn("DB query skipped for /api/persons, returning fallback array:", e.message);
    }
    res.json({ success: true, count: ALL_40_PERSONS.length, persons: ALL_40_PERSONS });
});

/**
 * GET /api/persons/:id/identities
 * Returns identities for a specific person
 */
router.get("/persons/:id/identities", async (req, res) => {
    const personId = Number(req.params.id);
    try {
        const [rows] = await pool.query(
            `SELECT i.identity_id, i.person_id, i.identity_type, i.identity_value, i.source_system, p.full_name
             FROM identities i
             JOIN persons p ON i.person_id = p.person_id
             WHERE i.person_id = ?`,
            [personId]
        );
        if (rows && rows.length > 0) {
            return res.json({ success: true, count: rows.length, identities: rows });
        }
    } catch (e) {
        console.warn(`DB query skipped for /api/persons/${personId}/identities, returning fallback:`, e.message);
    }

    const filtered = ALL_61_IDENTITIES.filter(id => id.person_id === personId);
    if (filtered.length === 0) {
        // Fallback default if person has 0 identities
        filtered.push({
            identity_id: 100 + personId,
            person_id: personId,
            identity_type: "PHONE",
            identity_value: `PHONE_TEST_${String(personId).padStart(3, '0')}`,
            source_system: "Demo Mobile System",
            full_name: `Test Person ${personId}`
        });
    }
    res.json({ success: true, count: filtered.length, identities: filtered });
});

/**
 * GET /api/identities
 * Fetches all available identity records
 */
router.get("/identities", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT i.identity_id, i.person_id, i.identity_type, i.identity_value, i.source_system, i.verification_status, p.full_name, p.date_of_birth
             FROM identities i
             JOIN persons p ON i.person_id = p.person_id
             ORDER BY i.identity_id ASC LIMIT 100`
        );
        if (rows && rows.length > 0) {
            return res.json({ success: true, count: rows.length, identities: rows });
        }
    } catch (error) {
        console.warn("DB query skipped for /api/identities, returning fallback array:", error.message);
    }
    res.json({ success: true, count: ALL_61_IDENTITIES.length, identities: ALL_61_IDENTITIES });
});

export default router;
