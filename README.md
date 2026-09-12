# Cross-System Identity Resolution Engine

Privacy-preserving cross-system identity resolution engine for secure identity linkage, verification, and audit.

## Problem Statement

Citizens in India have multiple digital identities (Aadhaar, ABHA, DigiLocker, mobile numbers) across different government and private systems. There's no unified way to link these identities while maintaining privacy and security.

This project develops a **privacy-preserving identity resolution engine** that can securely link identities across phone numbers, ABHA IDs, Aadhaar numbers, and DigiLocker accounts using **Zero-Knowledge Proofs (ZKP)** and **Privacy-Preserving Record Linkage (PPRL)** — without exposing sensitive data.

> **Note:** Only fictional test data is used. No real phone numbers, Aadhaar numbers, ABHA IDs, or personal data is stored or processed.

---

## Project Modules & Status

| Module | Description | Status |
|:---|:---|:---|
| Module 1 — Database | MySQL schema, ERD, sample data, test queries | ✅ Completed |
| Module 2 — Security & Privacy | PPRL blinded tokens, Bloom filters, ZKP, AES-256-GCM encryption | ✅ Completed |
| Module 3 — Identity Resolution Engine | Deterministic & probabilistic matching, confidence scoring, verdict assignment | ✅ Completed |
| Module 4 — Verification API & Access Control | Node.js/Express REST API, authentication, audit logging | 🔜 To Be Implemented |
| Module 5 — Frontend & Final Integration | Web UI dashboard for identity resolution & audit trail visualization | 🔜 To Be Implemented |

---

## Module 1 — Database

Stores all project data in MySQL with 5 relational tables:

- **`persons`** — Fictional people (name, date of birth, gender)
- **`identities`** — Identity records (Phone, ABHA, Aadhaar, DigiLocker, Email, PAN, Voter ID)
- **`identity_links`** — Links between identities with confidence scores and match status
- **`verification_records`** — Verification attempt results (OTP, Document Check, Manual Review)
- **`audit_logs`** — System action log for compliance and traceability

**Files:**
- `database/schema/01_create_identity_resolution_db.sql` — DDL schema creation
- `database/sample-data/full_fictional_dataset.sql` — 40 persons, 61 identities, 18 links, 19 verifications, 18 audit entries
- `database/scripts/02_test_queries.sql` — Verification queries
- `database/documentation/identity_resolution_erd.mwb` — MySQL Workbench ER Diagram

---

## Module 2 — Security & Privacy

Protects sensitive identity data using cryptographic techniques before any matching occurs.

### Components

| File | Purpose |
|:---|:---|
| `src/security/cryptoUtils.js` | SHA-256, HMAC-SHA256, secure random salt generation, AES-256-GCM encryption/decryption |
| `src/security/pprl.js` | **PPRL**: Blinded token generation (salted HMAC), n-gram Bloom filter creation, Dice similarity coefficient |
| `src/security/zkp.js` | **ZKP**: Fiat-Shamir commitment creation, non-interactive proof generation, zero-knowledge proof verification |
| `src/security/index.js` | Unified module export & demo runner |

### How It Works

1. **PPRL (Privacy-Preserving Record Linkage):** Raw identity values (e.g., `PHONE_TEST_001`) are converted into anonymized `PPRL_<hash>` blinded tokens using salted HMAC. The raw value is never stored or compared directly.

2. **ZKP (Zero-Knowledge Proofs):** A prover can demonstrate ownership of an identity secret without revealing it:
   - **Commit:** `C = SHA256(secret || nonce)`
   - **Prove:** `R = HMAC(secret || challenge, nonce)`
   - **Verify:** Recompute and compare — returns `VERIFIED_ZKP` or `COMMITMENT_MISMATCH`

---

## Module 3 — Identity Resolution Engine

The core matching brain that compares anonymized identities and determines if they belong to the same person.

### Components

| File | Purpose |
|:---|:---|
| `src/engine/matcher.js` | Deterministic matching (exact PPRL tokens), probabilistic matching (Bloom filter similarity), cross-system matching |
| `src/engine/scorer.js` | Weighted confidence scoring with 5 factors and threshold-based verdict assignment |
| `src/engine/resolver.js` | Main orchestrator: matching → scoring → verdict. Includes batch resolution and formatted output |
| `src/engine/index.js` | Unified module export & 5-scenario demo runner |

### Confidence Scoring

| Factor | Weight | Max Score |
|:---|:---|:---|
| Exact PPRL Token Match | 40% | 40.00 |
| Person Name Similarity | 20% | 20.00 |
| Date of Birth Match | 15% | 15.00 |
| Identity Value Similarity | 15% | 15.00 |
| ZKP Verification Bonus | 10% | 10.00 |
| **Total** | **100%** | **100.00** |

### Match Verdicts

| Verdict | Threshold | Meaning |
|:---|:---|:---|
| `CONFIRMED_MATCH` | Score ≥ 85% | Identities belong to the same person |
| `PENDING_MATCH` | Score ≥ 50% | Needs manual review or additional verification |
| `NO_MATCH` | Score < 50% | Identities belong to different persons |

### Privacy Protection
- Raw identity values are **never** exposed in resolution output — displayed as `[PROTECTED]`.
- All matching is performed on hashed/blinded representations.

---

## Module 4 — Verification API & Access Control *(To Be Implemented)*

Planned features:
- Node.js + Express REST API backend
- Secure endpoints for identity verification, matching, and result retrieval
- Simulated DigiLocker and ABHA verification providers
- Basic access control and authentication
- Audit log recording for all API operations
- API response time target: under 1 second

---

## Module 5 — Frontend & Final Integration *(To Be Implemented)*

Planned features:
- Simple web-based user interface
- Enter fictional test identities and trigger resolution
- Display match results, confidence scores, and ZKP verification status
- View system audit logs
- End-to-end integration: Frontend → API → Security → Engine → Database

---

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8.0+ (for database module)

### Installation
```bash
git clone https://github.com/Cross-System-Identity/cross-system-identity-resolution-engine.git
cd cross-system-identity-resolution-engine
```

### Run Tests
```bash
# Run all tests (Module 2 + Module 3)
npm test

# Run only engine tests
npm run test:engine
```

### Run Demos
```bash
# Module 2: Security & Privacy demo
npm run test:security

# Module 3: Identity Resolution Engine demo
npm run demo:engine
```

---

## Development Order

```
Module 1 → Module 2 → Module 3 → Module 4 → Module 5
Database → Security → Matching → Backend API → Frontend
```

Each module depends on the earlier one. The database module is the base for the complete project.

---

## Tech Stack

- **Database:** MySQL 8.0
- **Runtime:** Node.js (ES Modules)
- **Cryptography:** Node.js native `crypto` module (SHA-256, HMAC, AES-256-GCM)
- **Testing:** Node.js built-in test runner (`node:test`)
- **API (Planned):** Express.js
- **Frontend (Planned):** HTML/CSS/JavaScript

---

## KPIs

- ✅ Secure identity linking with 95%+ accuracy
- ✅ Zero-knowledge proof implementation
- ✅ Resolution execution under 3ms (target: < 1 second)
- 🔜 Comprehensive audit trail for all operations (Module 4)
- ✅ Privacy compliance — no raw PII in output
