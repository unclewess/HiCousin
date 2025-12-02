/**
 * M-Pesa Message Parser
 * Extracts payment details from SMS/WhatsApp messages
 */

export interface ParsedMessage {
    amount: number | null;
    reference: string | null;
    date: Date | null;
    channel: 'MPESA' | 'BANK' | 'UNKNOWN';
    recipient?: string;
    confidence: number; // 0.0 - 1.0
    rawFields: {
        amountText?: string;
        dateText?: string;
        referenceText?: string;
    };
}

interface RegexPattern {
    name: string;
    pattern: RegExp;
    extractor: (match: RegExpMatchArray) => Partial<ParsedMessage>;
}

/**
 * M-Pesa Send Money Pattern
 * Example: "TKT95BDMTY Confirmed. Ksh1,000.00 sent to ARNOLD TEZI 0799174938 on 29/11/25 at 2:24 PM"
 */
const MPESA_SEND_PATTERN: RegexPattern = {
    name: 'MPESA_SEND',
    pattern: /^([A-Z0-9]{10})\s+Confirmed\.\s+Ksh([\d,]+(?:\.\d{2})?)\s+sent to\s+(.+?)\s+(?:for account\s+(.+?)\s+)?on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s+[AP]M)/i,
    extractor: (match) => ({
        reference: match[1],
        amount: parseAmount(match[2]),
        recipient: match[3].trim(),
        date: parseDate(match[5], match[6]),
        channel: 'MPESA',
        rawFields: {
            amountText: match[2],
            dateText: `${match[5]} at ${match[6]}`,
            referenceText: match[1],
        },
    }),
};

/**
 * M-Pesa Receive Money Pattern
 * Example: "TKS12345AB Confirmed. You have received Ksh5,000.00 from JOHN DOE 0712345678 on 30/11/24 at 10:30 AM"
 */
const MPESA_RECEIVE_PATTERN: RegexPattern = {
    name: 'MPESA_RECEIVE',
    pattern: /^([A-Z0-9]{10})\s+Confirmed\.\s+(?:You have received|Ksh)\s+Ksh([\d,]+(?:\.\d{2})?)\s+(?:from|received from)\s+(.+?)\s+(?:\d{10}|\d{4})\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s+[AP]M)/i,
    extractor: (match) => ({
        reference: match[1],
        amount: parseAmount(match[2]),
        recipient: match[3].trim(),
        date: parseDate(match[4], match[5]),
        channel: 'MPESA',
        rawFields: {
            amountText: match[2],
            dateText: `${match[4]} at ${match[5]}`,
            referenceText: match[1],
        },
    }),
};

/**
 * Bank Deposit Pattern
 * Example: "Your account has been credited with KES 10,000.00 on 01/12/2024. Ref: BNK123456"
 */
const BANK_DEPOSIT_PATTERN: RegexPattern = {
    name: 'BANK_DEPOSIT',
    pattern: /(?:credited|deposit).*?(?:KES|Ksh)\s*([\d,]+(?:\.\d{2})?).*?(?:on|date)\s*(\d{1,2}\/\d{1,2}\/\d{2,4}).*?(?:ref|reference)[\s:]*([A-Z0-9-]+)/i,
    extractor: (match) => ({
        amount: parseAmount(match[1]),
        date: parseDate(match[2]),
        reference: match[3].toUpperCase().trim(),
        channel: 'BANK',
        rawFields: {
            amountText: match[1],
            dateText: match[2],
            referenceText: match[3],
        },
    }),
};

const PATTERNS: RegexPattern[] = [
    MPESA_SEND_PATTERN,
    MPESA_RECEIVE_PATTERN,
    BANK_DEPOSIT_PATTERN,
];

/**
 * Parse amount string to number
 * Handles: "1,000.00", "1000", "1,000"
 */
function parseAmount(amountText: string): number | null {
    const cleaned = amountText.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Parse date string to Date object
 * Handles: "29/11/25", "29/11/2025", "01/12/24"
 * Always treats as DD/MM/YY(YY)
 */
function parseDate(dateText: string, timeText?: string): Date | null {
    try {
        // Extract date parts
        const dateParts = dateText.split('/');
        if (dateParts.length !== 3) return null;

        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
        let year = parseInt(dateParts[2], 10);

        // Handle 2-digit years (assume 2000s)
        if (year < 100) {
            year += 2000;
        }

        // Validate ranges
        if (day < 1 || day > 31 || month < 0 || month > 11) {
            return null;
        }

        // Parse time if provided
        let hours = 0;
        let minutes = 0;

        if (timeText) {
            const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
            if (timeMatch) {
                hours = parseInt(timeMatch[1], 10);
                minutes = parseInt(timeMatch[2], 10);
                const isPM = timeMatch[3].toUpperCase() === 'PM';

                // Convert to 24-hour format
                if (isPM && hours !== 12) hours += 12;
                if (!isPM && hours === 12) hours = 0;
            }
        }

        const date = new Date(year, month, day, hours, minutes);

        // Validate date is valid
        if (isNaN(date.getTime())) return null;

        return date;
    } catch {
        return null;
    }
}

/**
 * Calculate confidence score based on extracted fields
 */
function calculateConfidence(parsed: Partial<ParsedMessage>): number {
    let score = 0;
    const weights = {
        amount: 0.4,
        reference: 0.3,
        date: 0.2,
        channel: 0.1,
    };

    if (parsed.amount != null && parsed.amount > 0) score += weights.amount;
    if (parsed.reference && parsed.reference.length >= 5) score += weights.reference;
    if (parsed.date) score += weights.date;
    if (parsed.channel !== 'UNKNOWN') score += weights.channel;

    return Math.min(score, 1.0);
}

/**
 * Main parser function
 * Attempts to match message against all known patterns
 */
export function parseMessage(messageText: string): ParsedMessage {
    const trimmed = messageText.trim();

    // Try each pattern
    for (const pattern of PATTERNS) {
        const match = trimmed.match(pattern.pattern);
        if (match) {
            const extracted = pattern.extractor(match);
            const confidence = calculateConfidence(extracted);

            return {
                amount: extracted.amount ?? null,
                reference: extracted.reference ?? null,
                date: extracted.date ?? null,
                channel: extracted.channel ?? 'UNKNOWN',
                recipient: extracted.recipient,
                confidence,
                rawFields: extracted.rawFields ?? {},
            };
        }
    }

    // No pattern matched
    return {
        amount: null,
        reference: null,
        date: null,
        channel: 'UNKNOWN',
        confidence: 0.0,
        rawFields: {},
    };
}

/**
 * Validate parsed message meets minimum requirements
 */
export function isValidParsedMessage(parsed: ParsedMessage, minConfidence = 0.7): boolean {
    return (
        parsed.confidence >= minConfidence &&
        parsed.amount !== null &&
        parsed.amount > 0 &&
        parsed.reference !== null &&
        parsed.reference.length > 0
    );
}
