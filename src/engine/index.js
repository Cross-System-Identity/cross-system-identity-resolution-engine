import { deterministicMatch, probabilisticMatch, crossSystemMatch } from './matcher.js';
import { calculateConfidenceScore, assignMatchVerdict, SCORING_WEIGHTS, MATCH_THRESHOLDS } from './scorer.js';
import { resolveIdentity, batchResolve, formatResolutionSummary } from './resolver.js';

/**
 * Unified Identity Resolution Engine Export
 */
export {
  // Matcher
  deterministicMatch,
  probabilisticMatch,
  crossSystemMatch,

  // Scorer
  calculateConfidenceScore,
  assignMatchVerdict,
  SCORING_WEIGHTS,
  MATCH_THRESHOLDS,

  // Resolver
  resolveIdentity,
  batchResolve,
  formatResolutionSummary
};

// Self-contained demonstration when executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  console.log('====================================================');
  console.log(' CROSS-SYSTEM IDENTITY RESOLUTION ENGINE            ');
  console.log(' MODULE 3: IDENTITY RESOLUTION ENGINE DEMO          ');
  console.log('====================================================\n');

  // --- Scenario 1: CONFIRMED MATCH (Same person, same identity type) ---
  console.log('--- SCENARIO 1: Same Person, Same Identity Type ---');
  const result1 = resolveIdentity(
    {
      identityType: 'PHONE',
      identityValue: 'PHONE_TEST_001',
      personName: 'Test Person One',
      dateOfBirth: '1998-05-14'
    },
    {
      identityType: 'PHONE',
      identityValue: 'PHONE_TEST_001',
      personName: 'Test Person One',
      dateOfBirth: '1998-05-14'
    }
  );
  console.log(formatResolutionSummary(result1));

  // --- Scenario 2: CONFIRMED MATCH (Cross-system: PHONE vs ABHA, same person) ---
  console.log('\n--- SCENARIO 2: Cross-System Match (Same Person) ---');
  const result2 = resolveIdentity(
    {
      identityType: 'PHONE',
      identityValue: 'PHONE_TEST_001',
      personName: 'Test Person One',
      dateOfBirth: '1998-05-14',
      secretForZkp: 'SHARED_SECRET_PERSON_1'
    },
    {
      identityType: 'ABHA',
      identityValue: 'ABHA_TEST_001',
      personName: 'Test Person One',
      dateOfBirth: '1998-05-14',
      secretForZkp: 'SHARED_SECRET_PERSON_1'
    },
    { enableZkp: true }
  );
  console.log(formatResolutionSummary(result2));

  // --- Scenario 3: NO MATCH (Different persons) ---
  console.log('\n--- SCENARIO 3: Different Persons ---');
  const result3 = resolveIdentity(
    {
      identityType: 'AADHAAR',
      identityValue: 'AADHAAR_TEST_001',
      personName: 'Test Person One',
      dateOfBirth: '1998-05-14'
    },
    {
      identityType: 'AADHAAR',
      identityValue: 'AADHAAR_TEST_999',
      personName: 'Test Person Forty',
      dateOfBirth: '2003-12-25'
    }
  );
  console.log(formatResolutionSummary(result3));

  // --- Scenario 4: PENDING MATCH (Partial overlap) ---
  console.log('\n--- SCENARIO 4: Partial Match (Pending) ---');
  const result4 = resolveIdentity(
    {
      identityType: 'DIGILOCKER',
      identityValue: 'DIGILOCKER_TEST_002',
      personName: 'Test Person Two',
      dateOfBirth: '2000-09-22'
    },
    {
      identityType: 'EMAIL',
      identityValue: 'EMAIL_TEST_005',
      personName: 'Test Person Two',
      dateOfBirth: '2000-09-22'
    }
  );
  console.log(formatResolutionSummary(result4));

  // --- Scenario 5: Batch Resolution ---
  console.log('\n--- SCENARIO 5: Batch Resolution ---');
  const batchResults = batchResolve([
    {
      recordA: { identityType: 'PHONE', identityValue: 'PHONE_TEST_003', personName: 'Test Person Three', dateOfBirth: '1997-01-11' },
      recordB: { identityType: 'ABHA', identityValue: 'ABHA_TEST_003', personName: 'Test Person Three', dateOfBirth: '1997-01-11' }
    },
    {
      recordA: { identityType: 'PHONE', identityValue: 'PHONE_TEST_004', personName: 'Test Person Four', dateOfBirth: '1999-02-12' },
      recordB: { identityType: 'PHONE', identityValue: 'PHONE_TEST_007', personName: 'Test Person Seven', dateOfBirth: '1995-05-15' }
    }
  ]);

  batchResults.forEach((r) => {
    console.log(`  Pair ${r.pairIndex}: ${r.matchResult} (${r.confidenceScore}%)`);
  });

  console.log('\n====================================================');
  console.log(' Module 3 Identity Resolution Engine demo complete. ');
  console.log('====================================================');
}
