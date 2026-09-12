/**
 * Confidence Scorer Module
 * Calculates weighted confidence scores and assigns match verdicts
 * based on deterministic and probabilistic matching results.
 */

/**
 * Weight configuration for scoring factors.
 * Weights sum to 1.0 for normalized scoring.
 */
export const SCORING_WEIGHTS = {
  EXACT_TOKEN_MATCH:    0.40,   // Deterministic PPRL blinded token match
  NAME_SIMILARITY:      0.20,   // Person name Bloom filter similarity
  DOB_MATCH:            0.15,   // Date of birth exact match
  IDENTITY_VALUE_SIMILARITY: 0.15, // Cross-system identity value similarity
  ZKP_VERIFICATION:     0.10    // Zero-Knowledge Proof verification bonus
};

/**
 * Threshold configuration for match verdicts.
 */
export const MATCH_THRESHOLDS = {
  CONFIRMED: 85.0,   // >= 85% confidence → CONFIRMED MATCH
  PENDING:   50.0,   // >= 50% confidence → PENDING MATCH
  NO_MATCH:   0.0    // < 50% confidence  → NO MATCH
};

/**
 * Calculates a weighted confidence score from matching results.
 *
 * @param {object} params
 * @param {boolean} params.exactTokenMatch - Whether PPRL tokens matched exactly
 * @param {number}  params.nameSimilarity - Name Bloom filter similarity (0.0–1.0)
 * @param {number}  params.dobMatch - DOB match (0.0 or 1.0)
 * @param {number}  params.identityValueSimilarity - Identity value Bloom similarity (0.0–1.0)
 * @param {boolean} params.zkpVerified - Whether ZKP verification passed
 * @returns {{ confidenceScore: number, breakdown: object }}
 */
export function calculateConfidenceScore({
  exactTokenMatch = false,
  nameSimilarity = 0,
  dobMatch = 0,
  identityValueSimilarity = 0,
  zkpVerified = false
} = {}) {
  const breakdown = {
    exactTokenScore:    (exactTokenMatch ? 1.0 : 0.0) * SCORING_WEIGHTS.EXACT_TOKEN_MATCH * 100,
    nameScore:          nameSimilarity * SCORING_WEIGHTS.NAME_SIMILARITY * 100,
    dobScore:           dobMatch * SCORING_WEIGHTS.DOB_MATCH * 100,
    identityValueScore: identityValueSimilarity * SCORING_WEIGHTS.IDENTITY_VALUE_SIMILARITY * 100,
    zkpScore:           (zkpVerified ? 1.0 : 0.0) * SCORING_WEIGHTS.ZKP_VERIFICATION * 100
  };

  const confidenceScore = parseFloat(
    (breakdown.exactTokenScore +
     breakdown.nameScore +
     breakdown.dobScore +
     breakdown.identityValueScore +
     breakdown.zkpScore).toFixed(2)
  );

  return {
    confidenceScore: Math.min(confidenceScore, 100.0),
    breakdown
  };
}

/**
 * Assigns a match verdict based on the confidence score.
 *
 * @param {number} confidenceScore - Score from 0.00 to 100.00
 * @returns {{ matchResult: string, description: string }}
 */
export function assignMatchVerdict(confidenceScore) {
  if (confidenceScore >= MATCH_THRESHOLDS.CONFIRMED) {
    return {
      matchResult: 'CONFIRMED_MATCH',
      description: 'Identities belong to the same person with high confidence.'
    };
  }

  if (confidenceScore >= MATCH_THRESHOLDS.PENDING) {
    return {
      matchResult: 'PENDING_MATCH',
      description: 'Partial match detected. Needs manual review or additional verification.'
    };
  }

  return {
    matchResult: 'NO_MATCH',
    description: 'Identities belong to different persons.'
  };
}
