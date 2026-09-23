# Cross-System Identity Resolution Engine

Privacy-preserving cross-system identity resolution engine for secure identity linkage, verification, and audit.

## Problem Statement

Citizens in India have multiple digital identities (Aadhaar, ABHA, DigiLocker, mobile numbers) across different government and private systems. There's no unified way to link these identities while maintaining privacy and security.

This project develops a **privacy-preserving identity resolution engine** that can securely link identities across phone numbers, ABHA IDs, Aadhaar numbers, and DigiLocker accounts using **Zero-Knowledge Proofs (ZKP)** and **Privacy-Preserving Record Linkage (PPRL)** — without exposing sensitive data.

> **Note:** Only fictional test data is used. No real phone numbers, Aadhaar numbers, ABHA IDs, or personal data is stored or processed.

---

## Project Modules & Status (6-Module Workflow)

| Module | Description | Status |
|:---|:---|:---|
| Module 1 — Database | MySQL schema, ERD, sample data, test queries | ✅ Completed |
| Module 2 — Security & Privacy | PPRL blinded tokens, Bloom filters, ZKP, AES encryption | ✅ Completed |
| Module 3 — Identity Resolution Engine | Deterministic & probabilistic matching, confidence scoring | ✅ Completed |
| Module 4 — Verification API & Access Control | Node.js/Express REST API, authentication, simulated providers | ✅ Completed |
| Module 5 — Audit Logging & Compliance | Centralized system tracking, logging integration for data protection | 🔜 To Be Implemented |
| Module 6 — Frontend & Final Integration | Web UI dashboard for identity resolution & audit visualization | 🔜 To Be Implemented |

---

## Module 1 — Database ✅

Stores all project data in MySQL with 5 relational tables:

- **`persons`** — Fictional people (name, date of birth, gender)
- **`identities`** — Identity records (Phone, ABHA, Aadhaar, DigiLocker, Email, PAN, Voter ID)
- **`identity_links`** — Links between identities with confidence scores and match status
- **`verification_records`** — Verification attempt results (OTP, Document Check, Manual Review)
- **`audit_logs`** — System action log for compliance and traceability

**Files:** `database/schema/01_create_identity_resolution_db.sql`, `database/sample-data/full_fictional_dataset.sql`, `database/scripts/02_test_queries.sql`

---

## Module 2 — Security & Privacy ✅

Protects sensitive identity data using cryptographic techniques before any matching occurs.

- **PPRL:** Raw identity values are converted into anonymized `PPRL_<hash>` blinded tokens using salted HMAC. The raw value is never stored or compared directly.
- **ZKP:** Proves ownership of an identity secret without revealing it using Fiat-Shamir non-interactive proofs.

**Files:** `src/security/cryptoUtils.js`, `src/security/pprl.js`, `src/security/zkp.js`, `src/security/index.js`

---

## Module 3 — Identity Resolution Engine ✅

The core matching brain that compares anonymized identities and determines if they belong to the same person.

- **Matching:** Deterministic (exact PPRL tokens) and probabilistic (Bloom filter similarity).
- **Scoring:** Weighted confidence scoring (Token Match 40%, Name 20%, DOB 15%, Identity Value 15%, ZKP 10%).
- **Verdicts:** `CONFIRMED_MATCH` (≥ 85%), `PENDING_MATCH` (≥ 50%), `NO_MATCH` (< 50%).

**Files:** `src/engine/matcher.js`, `src/engine/scorer.js`, `src/engine/resolver.js`, `src/engine/index.js`

---

## Module 4 — Verification API & Access Control ✅

The Node.js/Express backend that connects the database, privacy module, and matching engine.

- **REST API:** Endpoints for `/api/verify` and `/api/match`.
- **Access Control:** Secured via `x-api-key` header authentication.
- **Simulations:** Simulates external identity verification providers (e.g., DigiLocker).
- **Performance:** Designed for sub-second response times.

**Files:** `src/api/server.js`, `src/api/auth.js`, `src/api/db.js`, `src/api/verification.js`, `src/api/matching.js`

---

## Module 5 — Audit Logging & Compliance *(To Be Implemented)* 🔜

Dedicated module for system traceability and data protection compliance.

- Centralized logging utility targeting the `audit_logs` database table.
- Records critical actions: verification attempts, match resolutions, and system access.
- Refactors Module 4 APIs to automatically trigger comprehensive audit trails.

---

## Module 6 — Frontend & Final Integration *(To Be Implemented)* 🔜

The final visual interface.

- Web UI where users can enter fictional test identities to check for matches.
- Displays match results, confidence scores, and ZKP verification status.
- Live feed of system audit logs.
- Full system integration: Frontend → API → Audit → Security → Engine → Database.

---

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8.0+

### Installation
```bash
git clone https://github.com/Cross-System-Identity/cross-system-identity-resolution-engine.git
cd cross-system-identity-resolution-engine
npm install
```

### Run Tests
```bash
# Run all unit tests (Security & Engine)
npm test
```

### Run API Server (Module 4)
```bash
node src/api/server.js
```

---

## Development Order

```text
Module 1 → Module 2 → Module 3 → Module 4 → Module 5 → Module 6
Database → Security → Matching → API → Audit → Frontend
```

Each module depends on the earlier one. The database module is the base for the complete project.

---

## KPIs

- ✅ Secure identity linking with 95%+ accuracy
- ✅ Zero-knowledge proof implementation
- ✅ API response time under 1 second
- 🔜 Comprehensive audit trail for all operations (Module 5)
- ✅ Privacy compliance — no raw PII exposed
