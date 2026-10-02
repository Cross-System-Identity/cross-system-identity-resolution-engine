import pool from "../src/api/db.js";

const firstNames = [
    "Aarav", "Priya", "Rajesh", "Ananya", "Vikram", "Sunita", "Amit", "Kavita",
    "Rohan", "Sneha", "Sanjay", "Deepika", "Aditya", "Neha", "Manoj", "Pooja", "Rahul", "Meera", "Vijay", "Anita", "Suresh", "Divya", "Arjun", "Ritu", "Alok", "Nisha", "Kiran", "Shweta", "Gaurav", "Preeti", "Varun", "Swati", "Nikhil", "Bhavna", "Kunal", "Rashmi", "Tarun", "Komal", "Harish", "Reema"
];

const lastNames = [
    "Sharma", "Patel", "Kumar", "Iyer", "Singh", "Verma", "Gupta", "Joshi",
    "Reddy", "Rao", "Nair", "Das", "Chowdhury", "Deshmukh", "Kulkarni", "Mehta", "Bhat", "Pillai", "Mishra", "Pandey", "Agarwal", "Saxena", "Bose", "Sen", "Yadav", "Tiwari", "Jha", "Thakur", "Chauhan", "Dutta"
];

function getRandomItem(arr, index) {
    return arr[index % arr.length];
}

function getRandomDob(index) {
    const year = 1970 + (index % 35);
    const month = String((index % 12) + 1).padStart(2, '0');
    const day = String((index % 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function seed350Citizens() {
    console.log("Starting database seeding for 350 Citizens & 600+ Identities...");

    try {
        // Disable foreign key checks to truncate safely
        await pool.query("SET FOREIGN_KEY_CHECKS = 0");
        await pool.query("TRUNCATE TABLE identity_links");
        await pool.query("TRUNCATE TABLE verification_records");
        await pool.query("TRUNCATE TABLE identities");
        await pool.query("TRUNCATE TABLE persons");
        await pool.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("Cleared existing tables.");

        // Insert 350 Persons
        const personValues = [];
        for (let i = 1; i <= 350; i++) {
            const firstName = getRandomItem(firstNames, i);
            const lastName = getRandomItem(lastNames, i * 7);
            const fullName = `${firstName} ${lastName}`;
            const dob = getRandomDob(i);
            const gender = i % 2 === 0 ? "FEMALE" : "MALE";
            personValues.push([i, fullName, dob, gender, new Date(), new Date()]);
        }

        await pool.query(
            `INSERT INTO persons (person_id, full_name, date_of_birth, gender, created_at, updated_at) VALUES ?`,
            [personValues]
        );
        console.log("Successfully inserted 350 Persons.");

        // Insert Identities for 350 Persons
        // Every person gets 1 to 3 identities across systems
        const identityValues = [];
        const linkValues = [];
        const verificationValues = [];

        let identityIdCounter = 1;
        let linkIdCounter = 1;
        let verifIdCounter = 1;

        const systemTypes = [
            { type: "PHONE", system: "Demo Mobile System", prefix: "PHONE_TEST_" },
            { type: "ABHA", system: "Demo Health System", prefix: "ABHA_TEST_" },
            { type: "AADHAAR", system: "Demo ID System", prefix: "AADHAAR_TEST_" },
            { type: "DIGILOCKER", system: "Demo Document System", prefix: "DIGILOCKER_TEST_" },
            { type: "EMAIL", system: "Demo Email System", prefix: "EMAIL_TEST_" },
            { type: "PAN", system: "Demo Tax System", prefix: "PAN_TEST_" },
            { type: "VOTER", system: "Demo Voter System", prefix: "VOTER_TEST_" }
        ];

        for (let pid = 1; pid <= 350; pid++) {
            const pad = String(pid).padStart(3, '0');
            const usedTypes = new Set();

            // Primary Identity
            const primaryIdx = pid % 7;
            const primarySys = systemTypes[primaryIdx];
            usedTypes.add(primarySys.type);

            const primaryId = identityIdCounter++;
            identityValues.push([
                primaryId, pid, primarySys.type, `${primarySys.prefix}${pad}`, primarySys.system, "VERIFIED", new Date(), new Date()
            ]);

            // Secondary Identity
            const secIdx = (pid + 2) % 7;
            const secSys = systemTypes[secIdx];
            if (!usedTypes.has(secSys.type)) {
                usedTypes.add(secSys.type);
                const secId = identityIdCounter++;
                identityValues.push([
                    secId, pid, secSys.type, `${secSys.prefix}${pad}`, secSys.system, "VERIFIED", new Date(), new Date()
                ]);

                // Identity link between primary and secondary
                linkValues.push([
                    linkIdCounter++, primaryId, secId, "CONFIRMED", 95.50, "PPRL Bloom Filter & DOB Match", new Date()
                ]);
            }

            // Tertiary Identity
            const tertIdx = (pid + 4) % 7;
            const tertSys = systemTypes[tertIdx];
            if (!usedTypes.has(tertSys.type)) {
                usedTypes.add(tertSys.type);
                const tertId = identityIdCounter++;
                identityValues.push([
                    tertId, pid, tertSys.type, `${tertSys.prefix}${pad}`, tertSys.system, "VERIFIED", new Date(), new Date()
                ]);

                linkValues.push([
                    linkIdCounter++, primaryId, tertId, "CONFIRMED", 92.80, "Exact PPRL Token Match", new Date()
                ]);
            }

            // Verification Record for primary identity
            if (pid <= 250) {
                verificationValues.push([
                    verifIdCounter++, primaryId, "PPRL_HASH_ZKP", "SUCCESS", new Date(), "Verified via ZKP Proof"
                ]);
            }
        }

        await pool.query(
            `INSERT INTO identities (identity_id, person_id, identity_type, identity_value, source_system, verification_status, created_at, updated_at) VALUES ?`,
            [identityValues]
        );
        console.log(`Successfully inserted ${identityValues.length} Identities.`);

        await pool.query(
            `INSERT INTO identity_links (link_id, source_identity_id, target_identity_id, link_status, confidence_score, match_reason, linked_at) VALUES ?`,
            [linkValues]
        );
        console.log(`Successfully inserted ${linkValues.length} Identity Links.`);

        await pool.query(
            `INSERT INTO verification_records (verification_id, identity_id, verification_method, verification_result, verified_at, remarks) VALUES ?`,
            [verificationValues]
        );
        console.log(`Successfully inserted ${verificationValues.length} Verification Records.`);

        console.log("Database seeding completed successfully!");
        return {
            personsCount: personValues.length,
            identitiesCount: identityValues.length,
            linksCount: linkValues.length,
            verificationsCount: verificationValues.length
        };
    } catch (error) {
        console.error("Seeding failed:", error.message);
        throw error;
    }
}

if (process.argv[1] && process.argv[1].endsWith("seed_350_citizens.js")) {
    seed350Citizens().then(res => {
        console.log("Summary:", JSON.stringify(res));
        process.exit(0);
    }).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
