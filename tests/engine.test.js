import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  deterministicMatch,
  probabilisticMatch,
  crossSystemMatch,
  calculateConfidenceScore,
  assignMatchVerdict,
  SCORING_WEIGHTS,
  MATCH_THRESHOLDS,
  resolveIdentity,
  batchResolve,
  formatResolutionSummary
} from '../src/engine/index.js';

describe('Module 3: Identity Resolution Engine Unit Tests', () => {

  // ─────────────────────────────────────────────
  // Matcher Tests
  // ─────────────────────────────────────────────
  describe('Deterministic Matching', () => {
    test('identical identities produce exact match', () => {
      const result = deterministicMatch(
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001' },
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001' }
      );
      assert.equal(result.isExactMatch, true);
    });

    test('different identities do not produce exact match', () => {
      const result = deterministicMatch(
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001' },
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_002' }
      );
      assert.equal(result.isExactMatch, false);
    });
  });

  describe('Probabilistic Matching', () => {
    test('identical values return similarity of 1.0', () => {
      const result = probabilisticMatch('ABHA_TEST_001', 'ABHA_TEST_001');
      assert.equal(result.similarity, 1.0);
    });

    test('different values return similarity below 1.0', () => {
      const result = probabilisticMatch('ABHA_TEST_001', 'DIGILOCKER_XYZ_999');
      assert.ok(result.similarity < 1.0);
    });
  });

  describe('Cross-System Matching', () => {
    test('same type records trigger deterministic matching', () => {
      const result = crossSystemMatch(
        { identityType: 'AADHAAR', identityValue: 'AADHAAR_TEST_001', personName: 'Test Person', dateOfBirth: '1998-05-14' },
        { identityType: 'AADHAAR', identityValue: 'AADHAAR_TEST_001', personName: 'Test Person', dateOfBirth: '1998-05-14' }
      );
      assert.ok(result.sameTypeMatch !== null);
      assert.equal(result.sameTypeMatch.isExactMatch, true);
      assert.equal(result.crossFieldScores.dobScore, 1.0);
    });

    test('different type records skip deterministic matching', () => {
      const result = crossSystemMatch(
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001' },
        { identityType: 'ABHA', identityValue: 'ABHA_TEST_001' }
      );
      assert.equal(result.sameTypeMatch, null);
    });
  });

  // ─────────────────────────────────────────────
  // Scorer Tests
  // ─────────────────────────────────────────────
  describe('Confidence Scoring', () => {
    test('perfect match scores 100%', () => {
      const { confidenceScore } = calculateConfidenceScore({
        exactTokenMatch: true,
        nameSimilarity: 1.0,
        dobMatch: 1.0,
        identityValueSimilarity: 1.0,
        zkpVerified: true
      });
      assert.equal(confidenceScore, 100.0);
    });

    test('no match scores 0%', () => {
      const { confidenceScore } = calculateConfidenceScore({
        exactTokenMatch: false,
        nameSimilarity: 0,
        dobMatch: 0,
        identityValueSimilarity: 0,
        zkpVerified: false
      });
      assert.equal(confidenceScore, 0);
    });

    test('only exact token match scores 40%', () => {
      const { confidenceScore } = calculateConfidenceScore({
        exactTokenMatch: true,
        nameSimilarity: 0,
        dobMatch: 0,
        identityValueSimilarity: 0,
        zkpVerified: false
      });
      assert.equal(confidenceScore, 40.0);
    });
  });

  describe('Match Verdict Assignment', () => {
    test('>= 85% returns CONFIRMED_MATCH', () => {
      const verdict = assignMatchVerdict(95.0);
      assert.equal(verdict.matchResult, 'CONFIRMED_MATCH');
    });

    test('>= 50% and < 85% returns PENDING_MATCH', () => {
      const verdict = assignMatchVerdict(60.0);
      assert.equal(verdict.matchResult, 'PENDING_MATCH');
    });

    test('< 50% returns NO_MATCH', () => {
      const verdict = assignMatchVerdict(30.0);
      assert.equal(verdict.matchResult, 'NO_MATCH');
    });
  });

  // ─────────────────────────────────────────────
  // Resolver (End-to-End) Tests
  // ─────────────────────────────────────────────
  describe('Identity Resolution (End-to-End)', () => {
    test('same person same identity → CONFIRMED_MATCH with high confidence', () => {
      const result = resolveIdentity(
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' },
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' }
      );
      assert.equal(result.matchResult, 'CONFIRMED_MATCH');
      assert.ok(result.confidenceScore >= 85.0);
    });

    test('different persons → NO_MATCH with low confidence', () => {
      const result = resolveIdentity(
        { identityType: 'AADHAAR', identityValue: 'AADHAAR_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' },
        { identityType: 'AADHAAR', identityValue: 'AADHAAR_TEST_999', personName: 'Test Person Forty', dateOfBirth: '2003-12-25' }
      );
      assert.equal(result.matchResult, 'NO_MATCH');
      assert.ok(result.confidenceScore < 50.0);
    });

    test('cross-system same person with ZKP → high confidence', () => {
      const result = resolveIdentity(
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14', secretForZkp: 'SECRET_1' },
        { identityType: 'ABHA', identityValue: 'ABHA_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14', secretForZkp: 'SECRET_1' },
        { enableZkp: true }
      );
      assert.ok(result.confidenceScore >= 45.0);
      assert.ok(result.zkp !== null);
      assert.equal(result.zkp.isValid, true);
    });

    test('resolution output never exposes raw identity values', () => {
      const result = resolveIdentity(
        { identityType: 'AADHAAR', identityValue: 'AADHAAR_TEST_001' },
        { identityType: 'AADHAAR', identityValue: 'AADHAAR_TEST_001' }
      );
      assert.equal(result.identityA.value, '[PROTECTED]');
      assert.equal(result.identityB.value, '[PROTECTED]');
    });

    test('resolution executes in under 50ms', () => {
      const result = resolveIdentity(
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' },
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' }
      );
      assert.ok(result.executionTimeMs < 50, `Execution took ${result.executionTimeMs}ms, expected < 50ms`);
    });
  });

  describe('Batch Resolution', () => {
    test('batch resolves multiple pairs correctly', () => {
      const results = batchResolve([
        {
          recordA: { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' },
          recordB: { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' }
        },
        {
          recordA: { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' },
          recordB: { identityType: 'PHONE', identityValue: 'PHONE_TEST_999', personName: 'Test Person Forty', dateOfBirth: '2003-12-25' }
        }
      ]);
      assert.equal(results.length, 2);
      assert.equal(results[0].matchResult, 'CONFIRMED_MATCH');
      assert.equal(results[1].matchResult, 'NO_MATCH');
    });
  });

  describe('Output Formatting', () => {
    test('formatResolutionSummary returns a string with verdict', () => {
      const result = resolveIdentity(
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' },
        { identityType: 'PHONE', identityValue: 'PHONE_TEST_001', personName: 'Test Person One', dateOfBirth: '1998-05-14' }
      );
      const summary = formatResolutionSummary(result);
      assert.ok(typeof summary === 'string');
      assert.ok(summary.includes('CONFIRMED_MATCH'));
    });
  });

});
