/**
 * Password & PIN Hashing Service
 * Uses bcrypt for secure password/PIN hashing
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a password or PIN using bcrypt
 * @param plainText - The plain text password/PIN to hash
 * @returns Hashed password/PIN
 */
export async function hashPassword(plainText: string): Promise<string> {
  try {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password or PIN against a hash
 * @param plainText - The plain text password/PIN to verify
 * @param hash - The bcrypt hash to compare against
 * @returns True if the password/PIN matches
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  try {
    return bcrypt.compare(plainText, hash);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

/**
 * Hash a 6-digit PIN (optimized for numeric input)
 * @param pin - 6-digit PIN as string
 * @returns Hashed PIN
 */
export async function hashPIN(pin: string): Promise<string> {
  // Validate PIN format
  if (!/^\d{6}$/.test(pin)) {
    throw new Error('PIN must be exactly 6 digits');
  }
  return hashPassword(pin);
}

/**
 * Verify a 6-digit PIN
 * @param pin - 6-digit PIN to verify
 * @param hash - The bcrypt hash to compare against
 * @returns True if PIN matches
 */
export async function verifyPIN(pin: string, hash: string): Promise<boolean> {
  // Validate PIN format
  if (!/^\d{6}$/.test(pin)) {
    return false;
  }
  return verifyPassword(pin, hash);
}

/**
 * Check if a hash needs rehashing (for future-proofing)
 */
export function needsRehash(hash: string): boolean {
  try {
    const [version, cost] = hash.split('$').slice(1, 3);
    return version !== '2b' || parseInt(cost, 10) < SALT_ROUNDS;
  } catch {
    return true;
  }
}
