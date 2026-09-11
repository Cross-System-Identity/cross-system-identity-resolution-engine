import { hmacSha256, sha256 } from './cryptoUtils.js';

/**
 * Privacy-Preserving Record Linkage (PPRL) Engine
 */

/**
 * Generates an anonymized, cryptographically blinded token for identity matching.
 * @param {string} identityType e.g., 'PHONE', 'ABHA', 'AADHAAR', 'DIGILOCKER'
 * @param {string} identityValue e.g., 'PHONE_TEST_001'
 * @param {string} systemSalt System or domain specific secret salt
 * @returns {{ blindedToken: string, identityType: string }} Anonymized token representation
 */
export function generateBlindedToken(identityType, identityValue, systemSalt = 'DEFAULT_PPRL_SALT_2026') {
  if (!identityType || !identityValue) {
    throw new Error('Identity type and identity value are required to generate blinded token.');
  }

  const normalizedType = String(identityType).trim().toUpperCase();
  const normalizedValue = String(identityValue).trim().toUpperCase();
  
  // Create composite blinded token using salted HMAC
  const payload = `${normalizedType}:${normalizedValue}`;
  const blindedToken = hmacSha256(payload, systemSalt);

  return {
    identityType: normalizedType,
    blindedToken: `PPRL_${blindedToken.substring(0, 32)}`,
    fullHash: blindedToken
  };
}

/**
 * Generates n-gram Bloom filter for Privacy-Preserving Record Linkage & fuzzy matching.
 * @param {string} identityValue 
 * @param {number} filterSize Bit array size (default 128)
 * @param {number} nGramSize Size of n-grams (default 2 for bigrams)
 * @returns {number[]} Array of bits (0s and 1s) representing the Bloom Filter
 */
export function generateBloomFilter(identityValue, filterSize = 128, nGramSize = 2) {
  if (!identityValue) return new Array(filterSize).fill(0);

  const str = `_${String(identityValue).trim().toUpperCase()}_`;
  const bitArray = new Array(filterSize).fill(0);
  const nGrams = [];

  for (let i = 0; i <= str.length - nGramSize; i++) {
    nGrams.push(str.substring(i, i + nGramSize));
  }

  nGrams.forEach((gram) => {
    // Generate 3 hash positions per n-gram
    const h1 = parseInt(sha256(gram + "_1").substring(0, 8), 16) % filterSize;
    const h2 = parseInt(sha256(gram + "_2").substring(0, 8), 16) % filterSize;
    const h3 = parseInt(sha256(gram + "_3").substring(0, 8), 16) % filterSize;

    bitArray[h1] = 1;
    bitArray[h2] = 1;
    bitArray[h3] = 1;
  });

  return bitArray;
}

/**
 * Computes Dice Similarity Coefficient between two PPRL Bloom filters.
 * @param {number[]} filterA 
 * @param {number[]} filterB 
 * @returns {number} Similarity score between 0.00 and 1.00
 */
export function calculateBloomSimilarity(filterA, filterB) {
  if (!filterA || !filterB || filterA.length !== filterB.length) return 0.0;

  let intersection = 0;
  let countA = 0;
  let countB = 0;

  for (let i = 0; i < filterA.length; i++) {
    if (filterA[i] === 1) countA++;
    if (filterB[i] === 1) countB++;
    if (filterA[i] === 1 && filterB[i] === 1) intersection++;
  }

  if (countA + countB === 0) return 1.0;
  return (2 * intersection) / (countA + countB);
}
