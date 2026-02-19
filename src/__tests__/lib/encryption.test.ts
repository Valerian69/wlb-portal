/**
 * Encryption Utility Tests
 * Tests for src/lib/server/crypto/encryption.ts
 */

import {
  generateEncryptionKey,
  generateIV,
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  hashSHA256,
  generateSecureToken,
} from '@/lib/server/crypto/encryption';

describe('Encryption Utilities', () => {
  describe('generateEncryptionKey', () => {
    it('should generate a 64-character hex string (256 bits)', () => {
      const key = generateEncryptionKey();
      expect(key).toHaveLength(64);
      expect(/^[0-9a-f]+$/i.test(key)).toBe(true);
    });

    it('should generate unique keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('generateIV', () => {
    it('should generate a 32-character hex string (128 bits)', () => {
      const iv = generateIV();
      expect(iv).toHaveLength(32);
      expect(/^[0-9a-f]+$/i.test(iv)).toBe(true);
    });

    it('should generate unique IVs each time', () => {
      const iv1 = generateIV();
      const iv2 = generateIV();
      expect(iv1).not.toBe(iv2);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plaintext = 'Hello, World!';
      const key = generateEncryptionKey();
      const iv = generateIV();

      const encrypted = encrypt(plaintext, key, iv);
      const decrypted = decrypt(encrypted, key, iv);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'Secret message';
      const key = generateEncryptionKey();
      const iv1 = generateIV();
      const iv2 = generateIV();

      const encrypted1 = encrypt(plaintext, key, iv1);
      const encrypted2 = encrypt(plaintext, key, iv2);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty strings', () => {
      const plaintext = '';
      const key = generateEncryptionKey();
      const iv = generateIV();

      const encrypted = encrypt(plaintext, key, iv);
      const decrypted = decrypt(encrypted, key, iv);

      expect(decrypted).toBe('');
    });

    it('should handle special characters', () => {
      const plaintext = 'Special chars: !@#$%^&*()_+-=[]{}|;:\'",.<>?/`~\\';
      const key = generateEncryptionKey();
      const iv = generateIV();

      const encrypted = encrypt(plaintext, key, iv);
      const decrypted = decrypt(encrypted, key, iv);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = 'Unicode: 你好世界 🌍 Привет мир';
      const key = generateEncryptionKey();
      const iv = generateIV();

      const encrypted = encrypt(plaintext, key, iv);
      const decrypted = decrypt(encrypted, key, iv);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error with wrong key', () => {
      const plaintext = 'Secret';
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      const iv = generateIV();

      const encrypted = encrypt(plaintext, key1, iv);
      
      expect(() => decrypt(encrypted, key2, iv)).toThrow();
    });

    it('should throw error with wrong IV', () => {
      const plaintext = 'Secret';
      const key = generateEncryptionKey();
      const iv1 = generateIV();
      const iv2 = generateIV();

      const encrypted = encrypt(plaintext, key, iv1);
      
      expect(() => decrypt(encrypted, key, iv2)).toThrow();
    });
  });

  describe('encryptObject and decryptObject', () => {
    it('should encrypt and decrypt objects correctly', () => {
      const obj = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        active: true,
      };
      const key = generateEncryptionKey();
      const iv = generateIV();

      const encrypted = encryptObject(obj, key, iv);
      const decrypted = decryptObject<typeof obj>(encrypted, key, iv);

      expect(decrypted).toEqual(obj);
    });

    it('should handle nested objects', () => {
      const obj = {
        user: {
          name: 'Jane',
          profile: {
            age: 25,
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
      };
      const key = generateEncryptionKey();
      const iv = generateIV();

      const encrypted = encryptObject(obj, key, iv);
      const decrypted = decryptObject<typeof obj>(encrypted, key, iv);

      expect(decrypted).toEqual(obj);
    });

    it('should handle arrays', () => {
      const obj = {
        items: [1, 2, 3, 4, 5],
        names: ['Alice', 'Bob', 'Charlie'],
      };
      const key = generateEncryptionKey();
      const iv = generateIV();

      const encrypted = encryptObject(obj, key, iv);
      const decrypted = decryptObject<typeof obj>(encrypted, key, iv);

      expect(decrypted).toEqual(obj);
    });

    it('should throw error for invalid JSON', () => {
      const key = generateEncryptionKey();
      const iv = generateIV();

      expect(() => decryptObject('invalid json', key, iv)).toThrow();
    });

    it('should handle decryption errors gracefully', () => {
      const key = generateEncryptionKey();
      const iv = generateIV();
      const invalidCiphertext = 'invalid-base64-ciphertext!@#$';

      expect(() => decryptObject(invalidCiphertext, key, iv)).toThrow();
    });
  });

  describe('hashSHA256', () => {
    it('should generate a 64-character hex string', () => {
      const hash = hashSHA256('test');
      expect(hash).toHaveLength(64);
      expect(/^[0-9a-f]+$/i.test(hash)).toBe(true);
    });

    it('should produce consistent hashes', () => {
      const hash1 = hashSHA256('test');
      const hash2 = hashSHA256('test');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashSHA256('test1');
      const hash2 = hashSHA256('test2');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', () => {
      const hash = hashSHA256('');
      expect(hash).toHaveLength(64);
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('should be one-way (cannot decrypt)', () => {
      const plaintext = 'sensitive data';
      const hash = hashSHA256(plaintext);
      
      // There's no decrypt function for SHA256 - it's one-way
      expect(hash).not.toBe(plaintext);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token of specified length', () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(32);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken(32);
      const token2 = generateSecureToken(32);
      expect(token1).not.toBe(token2);
    });

    it('should use alphanumeric characters', () => {
      const token = generateSecureToken(100);
      expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
    });

    it('should handle different lengths', () => {
      expect(generateSecureToken(16)).toHaveLength(16);
      expect(generateSecureToken(64)).toHaveLength(64);
      expect(generateSecureToken(128)).toHaveLength(128);
    });
  });
});
