/**
 * Encryption Utility for Message Storage
 * Uses AES-256-GCM for secure encryption of SMS/WhatsApp messages
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment
 * Falls back to a default key for development (NOT for production!)
 */
function getEncryptionKey(): Buffer {
    const keyHex = process.env.ENCRYPTION_KEY;

    if (!keyHex) {
        console.warn('⚠️  ENCRYPTION_KEY not set! Using insecure default key for development.');
        console.warn('   Generate a secure key with: openssl rand -hex 32');
        // Insecure default for development only
        return Buffer.from('0'.repeat(64), 'hex');
    }

    if (keyHex.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }

    return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt a message
 * Returns: base64 encoded string containing IV + encrypted data + auth tag
 */
export function encrypt(plaintext: string): string {
    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(plaintext, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        const tag = cipher.getAuthTag();

        // Combine: IV + encrypted data + auth tag
        const combined = Buffer.concat([iv, encrypted, tag]);

        return combined.toString('base64');
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt message');
    }
}

/**
 * Decrypt a message
 * Input: base64 encoded string from encrypt()
 */
export function decrypt(encryptedBase64: string): string {
    try {
        const key = getEncryptionKey();
        const combined = Buffer.from(encryptedBase64, 'base64');

        // Extract components
        const iv = combined.subarray(0, IV_LENGTH);
        const tag = combined.subarray(combined.length - TAG_LENGTH);
        const encrypted = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt message - data may be corrupted or key is incorrect');
    }
}

/**
 * Test encryption/decryption
 */
export function testEncryption() {
    const testMessage = 'TKT95BDMTY Confirmed. Ksh1,000.00 sent to ARNOLD TEZI on 29/11/25';

    console.log('🔐 Testing Encryption...');
    console.log('Original:', testMessage);

    const encrypted = encrypt(testMessage);
    console.log('Encrypted:', encrypted.substring(0, 50) + '...');

    const decrypted = decrypt(encrypted);
    console.log('Decrypted:', decrypted);

    const success = testMessage === decrypted;
    console.log(success ? '✅ Test passed!' : '❌ Test failed!');

    return success;
}
