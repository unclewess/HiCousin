/**
 * Hashing Utility for Duplicate Detection
 * Uses SHA-256 for generating unique hashes
 */

import crypto from 'crypto';

/**
 * Generate SHA-256 hash from a string
 */
export function sha256(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generate hash from raw message for duplicate detection
 * Normalizes whitespace and case before hashing
 */
export function generateMessageHash(message: string): string {
    // Normalize: trim, collapse whitespace, lowercase
    const normalized = message
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();

    return sha256(normalized);
}

/**
 * Generate canonical proof hash for duplicate detection
 * Format: reference|amount|date|familyId
 */
export function generateProofHash(
    reference: string | null,
    amount: number,
    date: Date,
    familyId: string
): string {
    // Format date as YYYY-MM-DD for consistency
    const dateStr = date.toISOString().split('T')[0];

    // Use 'NOREF' if reference is null (for proofless claims)
    const refStr = reference || 'NOREF';

    // Create canonical string
    const canonical = `${refStr}|${amount}|${dateStr}|${familyId}`;

    return sha256(canonical);
}

/**
 * Check if two message hashes match (duplicate detection)
 */
export function isDuplicateMessage(hash1: string, hash2: string): boolean {
    return hash1 === hash2;
}

/**
 * Test hashing functions
 */
export function testHashing() {
    console.log('🔐 Testing Hashing...\n');

    // Test message hash
    const message1 = 'TKT95BDMTY Confirmed. Ksh1,000.00 sent to ARNOLD TEZI';
    const message2 = '  TKT95BDMTY   Confirmed.   Ksh1,000.00   sent to ARNOLD TEZI  '; // Extra whitespace
    const message3 = 'TKT95BDMTY Confirmed. Ksh2,000.00 sent to ARNOLD TEZI'; // Different amount

    const hash1 = generateMessageHash(message1);
    const hash2 = generateMessageHash(message2);
    const hash3 = generateMessageHash(message3);

    console.log('Message Hash 1:', hash1);
    console.log('Message Hash 2 (whitespace):', hash2);
    console.log('Same hash?', hash1 === hash2 ? '✅' : '❌');
    console.log('');

    console.log('Message Hash 3 (different):', hash3);
    console.log('Different hash?', hash1 !== hash3 ? '✅' : '❌');
    console.log('');

    // Test proof hash
    const proofHash1 = generateProofHash('TKT95BDMTY', 1000, new Date('2025-11-29'), 'family123');
    const proofHash2 = generateProofHash('TKT95BDMTY', 1000, new Date('2025-11-29'), 'family123');
    const proofHash3 = generateProofHash('TKT95BDMTY', 1000, new Date('2025-11-30'), 'family123'); // Different date

    console.log('Proof Hash 1:', proofHash1);
    console.log('Proof Hash 2 (same):', proofHash2);
    console.log('Same hash?', proofHash1 === proofHash2 ? '✅' : '❌');
    console.log('');

    console.log('Proof Hash 3 (different date):', proofHash3);
    console.log('Different hash?', proofHash1 !== proofHash3 ? '✅' : '❌');

    return true;
}
