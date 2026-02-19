/**
 * Password Hashing Utility Tests
 * Tests for src/lib/server/crypto/password.ts
 */

import {
  hashPassword,
  verifyPassword,
  hashPIN,
  verifyPIN,
  needsRehash,
} from '@/lib/server/crypto/password';

describe('Password Hashing Utilities', () => {
  describe('hashPassword', () => {
    it('should generate a hash string', async () => {
      const hash = await hashPassword('password123');
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(60); // bcrypt hash length
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword('password123');
      const hash2 = await hashPassword('password123');
      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should handle empty passwords', async () => {
      const hash = await hashPassword('');
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(60);
    });

    it('should handle special characters', async () => {
      const password = 'P@$$w0rd!#$%^&*()';
      const hash = await hashPassword(password);
      expect(typeof hash).toBe('string');
    });

    it('should handle unicode characters', async () => {
      const password = '密码 🌍 Привет';
      const hash = await hashPassword(password);
      expect(typeof hash).toBe('string');
    });

    it('should handle long passwords', async () => {
      const password = 'a'.repeat(1000);
      const hash = await hashPassword(password);
      expect(typeof hash).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'correctPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'correctPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      const isValid = await verifyPassword('password', 'invalid_hash');
      expect(isValid).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'Password123';
      const hash = await hashPassword(password);
      
      expect(await verifyPassword('Password123', hash)).toBe(true);
      expect(await verifyPassword('password123', hash)).toBe(false);
      expect(await verifyPassword('PASSWORD123', hash)).toBe(false);
    });
  });

  describe('hashPIN and verifyPIN', () => {
    it('should hash a valid 6-digit PIN', async () => {
      const pin = '123456';
      const hash = await hashPIN(pin);
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(60);
    });

    it('should verify a correct PIN', async () => {
      const pin = '654321';
      const hash = await hashPIN(pin);
      const isValid = await verifyPIN(pin, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect PIN', async () => {
      const pin = '123456';
      const wrongPin = '654321';
      const hash = await hashPIN(pin);
      const isValid = await verifyPIN(wrongPin, hash);
      expect(isValid).toBe(false);
    });

    it('should reject PINs with less than 6 digits', async () => {
      await expect(hashPIN('12345')).rejects.toThrow('PIN must be exactly 6 digits');
    });

    it('should reject PINs with more than 6 digits', async () => {
      await expect(hashPIN('1234567')).rejects.toThrow('PIN must be exactly 6 digits');
    });

    it('should reject non-numeric PINs', async () => {
      await expect(hashPIN('12345a')).rejects.toThrow('PIN must be exactly 6 digits');
      await expect(hashPIN('abcdef')).rejects.toThrow('PIN must be exactly 6 digits');
    });

    it('should reject empty PIN', async () => {
      await expect(hashPIN('')).rejects.toThrow('PIN must be exactly 6 digits');
    });

    it('should verify PIN is case insensitive (all numbers)', async () => {
      const pin = '123456';
      const hash = await hashPIN(pin);
      expect(await verifyPIN(pin, hash)).toBe(true);
    });
  });

  describe('needsRehash', () => {
    it('should return false for properly hashed password', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);
      expect(needsRehash(hash)).toBe(false);
    });

    it('should return true for invalid hash format', () => {
      expect(needsRehash('invalid_hash')).toBe(true);
      expect(needsRehash('')).toBe(true);
    });

    it('should return true for old bcrypt version', () => {
      // Old bcrypt format with version 2a and low cost
      const oldHash = '$2a$04$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuvwxyz12345';
      expect(needsRehash(oldHash)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete password flow', async () => {
      const password = 'MySecurePassword123!';
      
      // Hash password
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      
      // Verify correct password
      expect(await verifyPassword(password, hash)).toBe(true);
      
      // Verify incorrect password
      expect(await verifyPassword('WrongPassword', hash)).toBe(false);
    });

    it('should handle complete PIN flow', async () => {
      const pin = '987654';
      
      // Hash PIN
      const hash = await hashPIN(pin);
      expect(hash).toBeDefined();
      
      // Verify correct PIN
      expect(await verifyPIN(pin, hash)).toBe(true);
      
      // Verify incorrect PIN
      expect(await verifyPIN('123456', hash)).toBe(false);
    });

    it('should handle multiple password verifications', async () => {
      const password = 'TestPassword';
      const hash = await hashPassword(password);
      
      // Verify multiple times
      for (let i = 0; i < 5; i++) {
        expect(await verifyPassword(password, hash)).toBe(true);
      }
    });
  });
});
