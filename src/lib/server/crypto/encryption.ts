/**
 * AES-256 Encryption Service
 * Implements AES-256-CBC encryption for sensitive data at rest
 */

import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

/**
 * Generate a random AES-256 encryption key
 */
export function generateEncryptionKey(): string {
  const key = CryptoJS.lib.WordArray.random(ENCRYPTION_KEY_LENGTH);
  return key.toString(CryptoJS.enc.Hex);
}

/**
 * Generate a random initialization vector
 */
export function generateIV(): string {
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
  return iv.toString(CryptoJS.enc.Hex);
}

/**
 * Encrypt plaintext using AES-256-CBC
 * @param plaintext - The data to encrypt
 * @param key - Hex-encoded 256-bit encryption key
 * @param iv - Hex-encoded 128-bit initialization vector
 * @returns Base64-encoded ciphertext
 */
export function encrypt(plaintext: string, key: string, iv: string): string {
  try {
    const keyParsed = CryptoJS.enc.Hex.parse(key);
    const ivParsed = CryptoJS.enc.Hex.parse(iv);
    const encrypted = CryptoJS.AES.encrypt(plaintext, keyParsed, {
      iv: ivParsed,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt ciphertext using AES-256-CBC
 * @param ciphertext - Base64-encoded encrypted data
 * @param key - Hex-encoded 256-bit encryption key
 * @param iv - Hex-encoded 128-bit initialization vector
 * @returns Decrypted plaintext
 */
export function decrypt(ciphertext: string, key: string, iv: string): string {
  try {
    const keyParsed = CryptoJS.enc.Hex.parse(key);
    const ivParsed = CryptoJS.enc.Hex.parse(iv);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, keyParsed, {
      iv: ivParsed,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt a JSON object
 */
export function encryptObject<T extends Record<string, unknown>>(
  obj: T,
  key: string,
  iv: string
): string {
  const jsonString = JSON.stringify(obj);
  return encrypt(jsonString, key, iv);
}

/**
 * Decrypt and parse a JSON object
 */
export function decryptObject<T extends Record<string, unknown>>(
  ciphertext: string,
  key: string,
  iv: string
): T {
  const decrypted = decrypt(ciphertext, key, iv);
  return JSON.parse(decrypted) as T;
}

/**
 * Hash data using SHA-256 (for non-reversible hashing)
 */
export function hashSHA256(data: string): string {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
}
