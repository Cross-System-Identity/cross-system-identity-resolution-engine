import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  sha256,
  hmacSha256,
  generateSalt,
  encryptAES256GCM,
  decryptAES256GCM,
  generateBlindedToken,
  generateBloomFilter,
  calculateBloomSimilarity,
  createIdentityCommitment,
  generateZeroKnowledgeProof,
  verifyZeroKnowledgeProof
} from '../src/security/index.js';

describe('Module 2: Security & Privacy Unit Tests', () => {

  describe('Cryptographic Utilities', () => {
    test('sha256 computes consistent hex hashes', () => {
      const hash1 = sha256('TEST_IDENTITY');
      const hash2 = sha256('TEST_IDENTITY');
      assert.equal(hash1, hash2);
      assert.equal(hash1.length, 64);
    });

    test('hmacSha256 produces salted hashes', () => {
      const hmac1 = hmacSha256('DATA', 'SALT_A');
      const hmac2 = hmacSha256('DATA', 'SALT_B');
      assert.notEqual(hmac1, hmac2);
    });

    test('AES-256-GCM encryption and decryption round-trip', () => {
      const secret = 'AADHAAR_TEST_1234_SECRET';
      const key = 'MY_ENCRYPTION_KEY_32_BYTES_SALT';
      
      const encrypted = encryptAES256GCM(secret, key);
      assert.ok(encrypted.iv);
      assert.ok(encrypted.encryptedData);
      assert.ok(encrypted.authTag);

      const decrypted = decryptAES256GCM(encrypted, key);
      assert.equal(decrypted, secret);
    });
  });

  describe('Privacy-Preserving Record Linkage (PPRL)', () => {
    test('generateBlindedToken produces deterministic blinded token', () => {
      const salt = 'DEMO_SYSTEM_SALT';
      const tokenA = generateBlindedToken('PHONE', 'PHONE_TEST_001', salt);
      const tokenB = generateBlindedToken('PHONE', 'PHONE_TEST_001', salt);
      const tokenDiff = generateBlindedToken('PHONE', 'PHONE_TEST_002', salt);

      assert.equal(tokenA.blindedToken, tokenB.blindedToken);
      assert.notEqual(tokenA.blindedToken, tokenDiff.blindedToken);
      assert.ok(tokenA.blindedToken.startsWith('PPRL_'));
    });

    test('Bloom filter similarity matches identical records with 1.00 score', () => {
      const bf1 = generateBloomFilter('ABHA_TEST_001');
      const bf2 = generateBloomFilter('ABHA_TEST_001');
      const similarity = calculateBloomSimilarity(bf1, bf2);
      assert.equal(similarity, 1.0);
    });

    test('Bloom filter similarity gives lower score for different records', () => {
      const bf1 = generateBloomFilter('ABHA_TEST_001');
      const bf2 = generateBloomFilter('DIGILOCKER_DIFFERENT_999');
      const similarity = calculateBloomSimilarity(bf1, bf2);
      assert.ok(similarity < 0.5);
    });
  });

  describe('Zero-Knowledge Proof (ZKP) Mechanisms', () => {
    test('createIdentityCommitment creates unique commitment with nonce', () => {
      const res = createIdentityCommitment('AADHAAR_TEST_001');
      assert.ok(res.commitment.startsWith('ZKP_C_'));
      assert.ok(res.nonce);
    });

    test('Zero-Knowledge Proof succeeds for valid secret and nonce', () => {
      const secret = 'PHONE_TEST_001';
      const nonce = generateSalt();
      
      const proofObj = generateZeroKnowledgeProof(secret, nonce);
      const verification = verifyZeroKnowledgeProof(secret, nonce, proofObj);

      assert.equal(verification.isValid, true);
      assert.equal(verification.matchStatus, 'VERIFIED_ZKP');
    });

    test('Zero-Knowledge Proof fails for invalid secret', () => {
      const secret = 'PHONE_TEST_001';
      const wrongSecret = 'PHONE_TEST_WRONG';
      const nonce = generateSalt();
      
      const proofObj = generateZeroKnowledgeProof(secret, nonce);
      const verification = verifyZeroKnowledgeProof(wrongSecret, nonce, proofObj);

      assert.equal(verification.isValid, false);
      assert.equal(verification.matchStatus, 'COMMITMENT_MISMATCH');
    });

    test('ZKP verification completes in under 10ms', () => {
      const start = performance.now();
      const secret = 'DIGILOCKER_TEST_002';
      const nonce = generateSalt();
      const proofObj = generateZeroKnowledgeProof(secret, nonce);
      verifyZeroKnowledgeProof(secret, nonce, proofObj);
      const duration = performance.now() - start;

      assert.ok(duration < 10, `Execution time was ${duration}ms, expected < 10ms`);
    });
  });

});
