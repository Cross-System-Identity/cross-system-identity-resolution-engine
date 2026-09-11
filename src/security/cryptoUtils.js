import crypto from 'node:crypto';

/**
 * Cryptographic Utility Helpers for Privacy & Security Module
 */

/**
 * Computes SHA-256 hash of string data.
 * @param {string} data 
 * @returns {string} Hex-encoded SHA-256 string
 */
export function sha256(data) {
  if (!data) return '';
  return crypto.createHash('sha256').update(String(data)).digest('hex');
}

/**
 * Computes salted HMAC-SHA256 digest.
 * @param {string} data 
 * @param {string} salt 
 * @returns {string} Hex-encoded HMAC-SHA256 string
 */
export function hmacSha256(data, salt) {
  if (!data) return '';
  const key = salt || 'DEFAULT_PPRL_SALT_KEY_2026';
  return crypto.createHmac('sha256', key).update(String(data)).digest('hex');
}

/**
 * Generates a cryptographically secure random salt hex string.
 * @param {number} bytesLength 
 * @returns {string} Hex string of random bytes
 */
export function generateSalt(bytesLength = 16) {
  return crypto.randomBytes(bytesLength).toString('hex');
}

/**
 * Encrypts data using AES-256-GCM.
 * @param {string} plainText 
 * @param {string} secretKey 32-byte key (or hashed to 32 bytes)
 * @returns {{ iv: string, encryptedData: string, authTag: string }}
 */
export function encryptAES256GCM(plainText, secretKey) {
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag
  };
}

/**
 * Decrypts AES-256-GCM encrypted data object.
 * @param {{ iv: string, encryptedData: string, authTag: string }} encryptedObj 
 * @param {string} secretKey 
 * @returns {string} Original plainText
 */
export function decryptAES256GCM(encryptedObj, secretKey) {
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const authTag = Buffer.from(encryptedObj.authTag, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
