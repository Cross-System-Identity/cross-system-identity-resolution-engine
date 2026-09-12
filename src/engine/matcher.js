import { generateBlindedToken, calculateBloomSimilarity, generateBloomFilter } from '../security/pprl.js';

/**
 * Identity Matcher Module
 * Provides deterministic (exact) and probabilistic (fuzzy) matching
 * using PPRL blinded tokens and Bloom filters from Module 2.
 */

/**
 * Performs deterministic (exact) matching between two identity records.
 * Compares PPRL blinded tokens — if tokens match, identities are identical.
 *
 * @param {object} identityA - { identityType, identityValue }
 * @param {object} identityB - { identityType, identityValue }
 * @param {string} systemSalt - Shared system salt for PPRL token generation
 * @returns {{ isExactMatch: boolean, tokenA: string, tokenB: string }}
 */
export function deterministicMatch(identityA, identityB, systemSalt = 'SYSTEM_SALT_2026') {
  const tokenA = generateBlindedToken(identityA.identityType, identityA.identityValue, systemSalt);
  const tokenB = generateBlindedToken(identityB.identityType, identityB.identityValue, systemSalt);

  return {
    isExactMatch: tokenA.fullHash === tokenB.fullHash,
    tokenA: tokenA.blindedToken,
    tokenB: tokenB.blindedToken
  };
}

/**
 * Performs probabilistic (fuzzy) matching using Bloom filter similarity.
 * Useful when identity values may differ slightly across systems (e.g. formatting differences).
 *
 * @param {string} valueA - First identity value
 * @param {string} valueB - Second identity value
 * @param {number} filterSize - Bloom filter bit array size
 * @returns {{ similarity: number, bloomFilterA: number[], bloomFilterB: number[] }}
 */
export function probabilisticMatch(valueA, valueB, filterSize = 256) {
  const bfA = generateBloomFilter(valueA, filterSize);
  const bfB = generateBloomFilter(valueB, filterSize);
  const similarity = calculateBloomSimilarity(bfA, bfB);

  return {
    similarity: parseFloat(similarity.toFixed(4)),
    bloomFilterA: bfA,
    bloomFilterB: bfB
  };
}

/**
 * Matches two identity records across different identity types.
 * For cross-system matching (e.g., matching a PHONE record against an ABHA record
 * that belong to the same person), we compare person-level attributes.
 *
 * @param {object} recordA - { identityType, identityValue, personName?, dateOfBirth? }
 * @param {object} recordB - { identityType, identityValue, personName?, dateOfBirth? }
 * @param {string} systemSalt
 * @returns {{ sameTypeMatch: object|null, crossFieldScores: object }}
 */
export function crossSystemMatch(recordA, recordB, systemSalt = 'SYSTEM_SALT_2026') {
  const result = {
    sameTypeMatch: null,
    crossFieldScores: {
      nameScore: 0,
      dobScore: 0,
      identityValueScore: 0
    }
  };

  // 1. If same identity type, do deterministic match on blinded tokens
  if (recordA.identityType && recordB.identityType &&
      recordA.identityType.toUpperCase() === recordB.identityType.toUpperCase()) {
    result.sameTypeMatch = deterministicMatch(recordA, recordB, systemSalt);
  }

  // 2. Cross-field: Name similarity via Bloom filters
  if (recordA.personName && recordB.personName) {
    const nameMatch = probabilisticMatch(recordA.personName, recordB.personName, 256);
    result.crossFieldScores.nameScore = nameMatch.similarity;
  }

  // 3. Cross-field: Date of birth exact match
  if (recordA.dateOfBirth && recordB.dateOfBirth) {
    result.crossFieldScores.dobScore =
      recordA.dateOfBirth === recordB.dateOfBirth ? 1.0 : 0.0;
  }

  // 4. Cross-field: Identity value similarity (fuzzy match across different systems)
  if (recordA.identityValue && recordB.identityValue) {
    const valueMatch = probabilisticMatch(recordA.identityValue, recordB.identityValue, 256);
    result.crossFieldScores.identityValueScore = valueMatch.similarity;
  }

  return result;
}
