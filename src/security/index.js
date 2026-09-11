import {
  sha256,
  hmacSha256,
  generateSalt,
  encryptAES256GCM,
  decryptAES256GCM
} from './cryptoUtils.js';

import {
  generateBlindedToken,
  generateBloomFilter,
  calculateBloomSimilarity
} from './pprl.js';

import {
  createIdentityCommitment,
  generateZeroKnowledgeProof,
  verifyZeroKnowledgeProof
} from './zkp.js';

/**
 * Unified Security & Privacy Module Export
 */
export {
  // Crypto Utils
  sha256,
  hmacSha256,
  generateSalt,
  encryptAES256GCM,
  decryptAES256GCM,

  // PPRL
  generateBlindedToken,
  generateBloomFilter,
  calculateBloomSimilarity,

  // ZKP
  createIdentityCommitment,
  generateZeroKnowledgeProof,
  verifyZeroKnowledgeProof
};

// Self-contained demonstration runner when executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  console.log('====================================================');
  console.log(' CROSS-SYSTEM IDENTITY RESOLUTION ENGINE ');
  console.log(' MODULE 2: SECURITY & PRIVACY MODULE DEMO ');
  console.log('====================================================\n');

  const testIdentity1 = 'AADHAAR_TEST_001';
  const testIdentity2 = 'ABHA_TEST_001';
  const systemSalt = 'GOVT_DEMO_SALT_2026';

  console.log('--- 1. PRIVACY-PRESERVING RECORD LINKAGE (PPRL) ---');
  const token1 = generateBlindedToken('AADHAAR', testIdentity1, systemSalt);
  const token2 = generateBlindedToken('ABHA', testIdentity2, systemSalt);
  console.log(`Raw Identity 1: ${testIdentity1} --> Blinded Token: ${token1.blindedToken}`);
  console.log(`Raw Identity 2: ${testIdentity2} --> Blinded Token: ${token2.blindedToken}`);

  console.log('\n--- 2. PPRL BLOOM FILTER SIMILARITY ---');
  const bf1 = generateBloomFilter(testIdentity1);
  const bf2 = generateBloomFilter('AADHAAR_TEST_001'); // Exact match
  const bf3 = generateBloomFilter('AADHAAR_TEST_999'); // Different ID
  console.log(`Bloom Filter Similarity (Identical IDs): ${(calculateBloomSimilarity(bf1, bf2) * 100).toFixed(2)}%`);
  console.log(`Bloom Filter Similarity (Different IDs): ${(calculateBloomSimilarity(bf1, bf3) * 100).toFixed(2)}%`);

  console.log('\n--- 3. ZERO-KNOWLEDGE PROOF (ZKP) VERIFICATION ---');
  const nonce = generateSalt();
  const proofPayload = generateZeroKnowledgeProof(testIdentity1, nonce);
  console.log(`ZKP Commitment Created: ${proofPayload.commitment}`);
  console.log(`ZKP Proof Response:    ${proofPayload.proofResponse}`);

  const verificationResult = verifyZeroKnowledgeProof(testIdentity1, nonce, proofPayload);
  console.log(`ZKP Verification Result: ${verificationResult.matchStatus} (Valid: ${verificationResult.isValid})`);
  console.log(`Reason: ${verificationResult.reason}`);

  console.log('\n====================================================');
  console.log(' Module 2 Security & Privacy verification complete. ');
  console.log('====================================================');
}
