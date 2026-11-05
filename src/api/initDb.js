import pool from "./db.js";
import { seed350Citizens } from "../../scripts/seed_350_citizens.js";

export async function initializeDatabase() {
    try {
        // Create persons table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS persons (
                person_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(150) NOT NULL,
                date_of_birth DATE,
                gender VARCHAR(20),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE = InnoDB;
        `);

        // Create identities table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS identities (
                identity_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                person_id BIGINT NOT NULL,
                identity_type VARCHAR(50) NOT NULL,
                identity_value VARCHAR(255) NOT NULL,
                source_system VARCHAR(100) NOT NULL,
                verification_status VARCHAR(30) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_identities_person FOREIGN KEY (person_id) REFERENCES persons(person_id),
                CONSTRAINT uq_identity_type_value UNIQUE (identity_type, identity_value)
            ) ENGINE = InnoDB;
        `);

        // Create identity_links table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS identity_links (
                link_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                source_identity_id BIGINT NOT NULL,
                target_identity_id BIGINT NOT NULL,
                link_status VARCHAR(30) NOT NULL,
                confidence_score DECIMAL(5,2) NOT NULL,
                match_reason VARCHAR(255),
                linked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_links_source_identity FOREIGN KEY (source_identity_id) REFERENCES identities(identity_id),
                CONSTRAINT fk_links_target_identity FOREIGN KEY (target_identity_id) REFERENCES identities(identity_id)
            ) ENGINE = InnoDB;
        `);

        // Create verification_records table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_records (
                verification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                identity_id BIGINT NOT NULL,
                verification_method VARCHAR(100) NOT NULL,
                verification_result VARCHAR(30) NOT NULL,
                verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                remarks VARCHAR(255),
                CONSTRAINT fk_verification_identity FOREIGN KEY (identity_id) REFERENCES identities(identity_id)
            ) ENGINE = InnoDB;
        `);

        // Create audit_logs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                action_type VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_id BIGINT NOT NULL,
                performed_by VARCHAR(100) NOT NULL,
                action_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                details VARCHAR(500)
            ) ENGINE = InnoDB;
        `);

        // Check if data is already present
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM persons');
        if (rows[0].count === 0) {
            console.log("Empty database detected. Auto-seeding 350 citizens dataset...");
            await seed350Citizens();
            console.log("Database initialized and seeded successfully!");
        } else {
            console.log(`Database connected: ${rows[0].count} citizens loaded.`);
        }
    } catch (err) {
        console.warn("Database initialization note:", err.message);
    }
}
