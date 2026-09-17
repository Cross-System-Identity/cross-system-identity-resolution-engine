/**
 * Confidence Scorer Module
 * Calculates weighted confidence scores and assigns match verdicts
 * based on deterministic and probabilistic matching results.
 */

/**
 * Standard scoring weights for same-type identity matching.
 */
export const SCORING_WEIGHTS = {
    EXACT_TOKEN_MATCH: 0.40,
    NAME_SIMILARITY: 0.20,
    DOB_MATCH: 0.15,
    IDENTITY_VALUE_SIMILARITY: 0.15,
    ZKP_VERIFICATION: 0.10
};

/**
 * Cross-system scoring weights.
 *
 * For different identity types such as PHONE ↔ ABHA,
 * exact PPRL token matching is not applicable.
 *
 * Therefore person-level attributes receive greater weight.
 */
export const CROSS_SYSTEM_SCORING_WEIGHTS = {
    NAME_SIMILARITY: 0.50,
    DOB_MATCH: 0.40,
    IDENTITY_VALUE_SIMILARITY: 0.05,
    ZKP_VERIFICATION: 0.05
};

/**
 * Threshold configuration for match verdicts.
 */
export const MATCH_THRESHOLDS = {
    CONFIRMED: 85.0,
    PENDING: 50.0,
    NO_MATCH: 0.0
};

/**
 * Calculates a weighted confidence score.
 *
 * @param {object} params
 * @param {boolean} params.exactTokenMatch
 * @param {number} params.nameSimilarity
 * @param {number} params.dobMatch
 * @param {number} params.identityValueSimilarity
 * @param {boolean} params.zkpVerified
 * @param {boolean} params.crossSystem
 */
export function calculateConfidenceScore({
    exactTokenMatch = false,
    nameSimilarity = 0,
    dobMatch = 0,
    identityValueSimilarity = 0,
    zkpVerified = false,
    crossSystem = false
} = {}) {

    let breakdown;

    if (crossSystem) {

        breakdown = {
            exactTokenScore: 0,

            nameScore:
                nameSimilarity *
                CROSS_SYSTEM_SCORING_WEIGHTS.NAME_SIMILARITY *
                100,

            dobScore:
                dobMatch *
                CROSS_SYSTEM_SCORING_WEIGHTS.DOB_MATCH *
                100,

            identityValueScore:
                identityValueSimilarity *
                CROSS_SYSTEM_SCORING_WEIGHTS.IDENTITY_VALUE_SIMILARITY *
                100,

            zkpScore:
                (zkpVerified ? 1.0 : 0.0) *
                CROSS_SYSTEM_SCORING_WEIGHTS.ZKP_VERIFICATION *
                100
        };

    } else {

        // Existing Module 3 scoring — preserved.
        breakdown = {
            exactTokenScore:
                (exactTokenMatch ? 1.0 : 0.0) *
                SCORING_WEIGHTS.EXACT_TOKEN_MATCH *
                100,

            nameScore:
                nameSimilarity *
                SCORING_WEIGHTS.NAME_SIMILARITY *
                100,

            dobScore:
                dobMatch *
                SCORING_WEIGHTS.DOB_MATCH *
                100,

            identityValueScore:
                identityValueSimilarity *
                SCORING_WEIGHTS.IDENTITY_VALUE_SIMILARITY *
                100,

            zkpScore:
                (zkpVerified ? 1.0 : 0.0) *
                SCORING_WEIGHTS.ZKP_VERIFICATION *
                100
        };
    }

    const confidenceScore = parseFloat(
        (
            breakdown.exactTokenScore +
            breakdown.nameScore +
            breakdown.dobScore +
            breakdown.identityValueScore +
            breakdown.zkpScore
        ).toFixed(2)
    );

    return {
        confidenceScore: Math.min(confidenceScore, 100.0),
        breakdown
    };
}

/**
 * Assigns a match verdict based on confidence score.
 *
 * @param {number} confidenceScore
 */
export function assignMatchVerdict(confidenceScore) {

    if (confidenceScore >= MATCH_THRESHOLDS.CONFIRMED) {
        return {
            matchResult: 'CONFIRMED_MATCH',
            description:
                'Identities belong to the same person with high confidence.'
        };
    }

    if (confidenceScore >= MATCH_THRESHOLDS.PENDING) {
        return {
            matchResult: 'PENDING_MATCH',
            description:
                'Partial match detected. Needs manual review or additional verification.'
        };
    }

    return {
        matchResult: 'NO_MATCH',
        description:
            'Identities belong to different persons.'
    };
}