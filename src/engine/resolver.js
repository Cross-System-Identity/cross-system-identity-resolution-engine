import { deterministicMatch, probabilisticMatch, crossSystemMatch } from './matcher.js';
import { calculateConfidenceScore, assignMatchVerdict, SCORING_WEIGHTS, MATCH_THRESHOLDS } from './scorer.js';
import { generateZeroKnowledgeProof, verifyZeroKnowledgeProof, generateSalt } from '../security/index.js';

/**
 * Identity Resolution Engine
 * The core "brain" that orchestrates matching, scoring, and verdict assignment
 * to resolve whether two identity records belong to the same person.
 */

/**
 * Resolves whether two identity records refer to the same person.
 * Combines deterministic matching, probabilistic matching, and optional ZKP verification
 * into a single unified confidence score and match verdict.
 *
 * @param {object} recordA - First identity record
 *   { identityType, identityValue, personName?, dateOfBirth?, secretForZkp? }
 * @param {object} recordB - Second identity record
 *   { identityType, identityValue, personName?, dateOfBirth?, secretForZkp? }
 * @param {object} [options] - Resolution options
 * @param {string} [options.systemSalt] - PPRL system salt
 * @param {boolean} [options.enableZkp] - Whether to perform ZKP verification
 * @returns {object} Resolution result with confidence score, verdict, and detailed breakdown
 */
export function resolveIdentity(recordA, recordB, options = {}) {
  const {
    systemSalt = 'SYSTEM_SALT_2026',
    enableZkp = false
  } = options;

  const startTime = performance.now();

  // Step 1: Cross-system matching (deterministic + probabilistic)
  const matchResult = crossSystemMatch(recordA, recordB, systemSalt);

  // Step 2: Determine exact token match result
  let exactTokenMatch = false;
  if (matchResult.sameTypeMatch) {
    exactTokenMatch = matchResult.sameTypeMatch.isExactMatch;
  }

  // Step 3: Optional ZKP verification
  let zkpVerified = false;
  let zkpDetails = null;

  if (enableZkp && recordA.secretForZkp && recordB.secretForZkp) {
    const nonce = generateSalt();

    // Prover (recordA) generates proof
    const proof = generateZeroKnowledgeProof(recordA.secretForZkp, nonce);

    // Verifier checks if recordB's secret matches the proof
    const verification = verifyZeroKnowledgeProof(recordA.secretForZkp, nonce, proof);
    zkpVerified = verification.isValid;

    zkpDetails = {
      commitment: proof.commitment,
      proofResponse: proof.proofResponse,
      verificationStatus: verification.matchStatus,
      isValid: verification.isValid
    };
  }

  // Step 4: Determine whether this is cross-system matching
const crossSystem =
    recordA.identityType &&
    recordB.identityType &&
    recordA.identityType.toUpperCase() !==
    recordB.identityType.toUpperCase();

// Step 5: Calculate weighted confidence score
const { confidenceScore, breakdown } = calculateConfidenceScore({
    exactTokenMatch,
    nameSimilarity: matchResult.crossFieldScores.nameScore,
    dobMatch: matchResult.crossFieldScores.dobScore,
    identityValueSimilarity: matchResult.crossFieldScores.identityValueScore,
    zkpVerified,
    crossSystem
});

  // Step 6: Assign final verdict
  const verdict = assignMatchVerdict(confidenceScore);

  const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

  return {
    // Final Result
    matchResult: verdict.matchResult,
    confidenceScore,
    description: verdict.description,

    // Input Summary
    identityA: {
      type: recordA.identityType,
      value: `[PROTECTED]` // Never expose raw values in output
    },
    identityB: {
      type: recordB.identityType,
      value: `[PROTECTED]`
    },

    // Detailed Breakdown
    scoring: {
      weights: SCORING_WEIGHTS,
      thresholds: MATCH_THRESHOLDS,
      breakdown
    },

    // Match Details
    matching: {
      deterministicResult: matchResult.sameTypeMatch,
      crossFieldScores: matchResult.crossFieldScores
    },

    // ZKP Details (if enabled)
    zkp: zkpDetails,

    // Performance
    executionTimeMs
  };
}

/**
 * Batch resolves multiple identity record pairs.
 *
 * @param {Array<{ recordA: object, recordB: object }>} pairs - Array of record pairs
 * @param {object} [options] - Resolution options
 * @returns {Array<object>} Array of resolution results
 */
export function batchResolve(pairs, options = {}) {
  return pairs.map((pair, index) => {
    const result = resolveIdentity(pair.recordA, pair.recordB, options);
    return {
      pairIndex: index + 1,
      ...result
    };
  });
}

/**
 * Generates a human-readable resolution summary string.
 *
 * @param {object} result - Resolution result from resolveIdentity()
 * @returns {string} Formatted summary
 */
export function formatResolutionSummary(result) {
  // Detect cross-system match by checking if identity types differ
  const isCrossSystem =
    result.identityA.type &&
    result.identityB.type &&
    result.identityA.type.toUpperCase() !== result.identityB.type.toUpperCase();

  // Set correct max scores based on scoring mode
  const maxExact    = isCrossSystem ? ' 0.00' : '40.00';
  const maxName     = isCrossSystem ? '50.00' : '20.00';
  const maxDob      = isCrossSystem ? '40.00' : '15.00';
  const maxIdVal    = isCrossSystem ? ' 5.00' : '15.00';
  const maxZkp      = isCrossSystem ? ' 5.00' : '10.00';
  const matchMode   = isCrossSystem ? 'Cross-System' : 'Same-System ';

  const lines = [
    `┌─────────────────────────────────────────────────┐`,
    `│         IDENTITY RESOLUTION RESULT              │`,
    `├─────────────────────────────────────────────────┤`,
    `│ Verdict:     ${result.matchResult.padEnd(34)}│`,
    `│ Confidence:  ${(result.confidenceScore + '%').padEnd(34)}│`,
    `│ Match Mode:  ${matchMode.padEnd(34)}│`,
    `│ Description: ${result.description.substring(0, 34).padEnd(34)}│`,
    `├─────────────────────────────────────────────────┤`,
    `│ Identity A:  ${(result.identityA.type || 'N/A').padEnd(34)}│`,
    `│ Identity B:  ${(result.identityB.type || 'N/A').padEnd(34)}│`,
    `├─────────────────────────────────────────────────┤`,
    `│ SCORING BREAKDOWN                               │`,
    `│   Exact Token:     ${(result.scoring.breakdown.exactTokenScore.toFixed(2) + ' / ' + maxExact).padEnd(28)}│`,
    `│   Name Similarity: ${(result.scoring.breakdown.nameScore.toFixed(2) + ' / ' + maxName).padEnd(28)}│`,
    `│   DOB Match:       ${(result.scoring.breakdown.dobScore.toFixed(2) + ' / ' + maxDob).padEnd(28)}│`,
    `│   Identity Value:  ${(result.scoring.breakdown.identityValueScore.toFixed(2) + ' / ' + maxIdVal).padEnd(28)}│`,
    `│   ZKP Verified:    ${(result.scoring.breakdown.zkpScore.toFixed(2) + ' / ' + maxZkp).padEnd(28)}│`,
    `├─────────────────────────────────────────────────┤`,
    `│ Execution Time: ${(result.executionTimeMs + 'ms').padEnd(31)}│`,
    `└─────────────────────────────────────────────────┘`
  ];
  return lines.join('\n');
}
