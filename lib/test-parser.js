// Quick parser validation script
// Run with: node lib/test-parser.js

const fs = require('fs');
const path = require('path');

// Inline simplified parser for testing
function parseAmount(amountText) {
    const cleaned = amountText.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
}

function parseDate(dateText, timeText) {
    try {
        const dateParts = dateText.split('/');
        if (dateParts.length !== 3) return null;

        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        let year = parseInt(dateParts[2], 10);

        if (year < 100) year += 2000;
        if (day < 1 || day > 31 || month < 0 || month > 11) return null;

        let hours = 0, minutes = 0;
        if (timeText) {
            const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
            if (timeMatch) {
                hours = parseInt(timeMatch[1], 10);
                minutes = parseInt(timeMatch[2], 10);
                const isPM = timeMatch[3].toUpperCase() === 'PM';
                if (isPM && hours !== 12) hours += 12;
                if (!isPM && hours === 12) hours = 0;
            }
        }

        return new Date(year, month, day, hours, minutes);
    } catch {
        return null;
    }
}

function parseMessage(messageText) {
    const trimmed = messageText.trim();

    // M-Pesa Send Pattern
    const mpesaSendPattern = /^([A-Z0-9]{10})\s+Confirmed\.\s+Ksh([\d,]+(?:\.\d{2})?)\s+sent to\s+(.+?)\s+(?:for account\s+(.+?)\s+)?on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s+[AP]M)/i;

    const match = trimmed.match(mpesaSendPattern);
    if (match) {
        const amount = parseAmount(match[2]);
        const reference = match[1];
        const date = parseDate(match[5], match[6]);
        const confidence = (amount && reference && date) ? 1.0 : 0.5;

        return {
            amount,
            reference,
            date,
            channel: 'MPESA',
            confidence,
            recipient: match[3].trim(),
        };
    }

    return { amount: null, reference: null, date: null, channel: 'UNKNOWN', confidence: 0.0 };
}

// Test messages
const tests = [
    {
        name: 'M-Pesa #1',
        message: 'TKT95BDMTY Confirmed. Ksh1,000.00 sent to ARNOLD  TEZI 0799174938 on 29/11/25 at 2:24 PM. New M-PESA balance is Ksh15,647.18.',
        expected: { amount: 1000, reference: 'TKT95BDMTY' }
    },
    {
        name: 'M-Pesa #2',
        message: 'TKT95BCZ9V Confirmed. Ksh10,253.00 sent to CIC Money Market Fund for account 00001-001-124004-002 on 29/11/25 at 10:41 AM New M-PESA balance is Ksh17,053.48.',
        expected: { amount: 10253, reference: 'TKT95BCZ9V' }
    },
    {
        name: 'M-Pesa #3',
        message: 'TKS95BC8CO Confirmed. Ksh2,000.00 sent to AMREF SACCO for account 8238-DEP on 28/11/25 at 9:47 PM New M-PESA balance is Ksh27,363.48.',
        expected: { amount: 2000, reference: 'TKS95BC8CO' }
    },
    {
        name: 'M-Pesa #4',
        message: 'TKR95B76IO Confirmed. Ksh1,730.00 sent to MATHEW  KOMEN 0704167779 on 27/11/25 at 3:49 PM. New M-PESA balance is Ksh2,408.48.',
        expected: { amount: 1730, reference: 'TKR95B76IO' }
    },
    {
        name: 'M-Pesa #5',
        message: 'TKR95B5UK3 Confirmed. Ksh355.00 sent to SHEILA  OPONDO 0705424188 on 27/11/25 at 8:14 AM. New M-PESA balance is Ksh4,171.48.',
        expected: { amount: 355, reference: 'TKR95B5UK3' }
    },
];

console.log('🧪 Testing M-Pesa Parser\n');

let passed = 0;
tests.forEach((test, i) => {
    const result = parseMessage(test.message);
    const amountOk = result.amount === test.expected.amount;
    const refOk = result.reference === test.expected.reference;

    console.log(`Test ${i + 1}: ${test.name}`);
    console.log(`  Amount: ${result.amount} ${amountOk ? '✅' : '❌'}`);
    console.log(`  Reference: ${result.reference} ${refOk ? '✅' : '❌'}`);
    console.log(`  Date: ${result.date ? result.date.toISOString() : 'null'}`);
    console.log(`  Confidence: ${result.confidence}`);

    if (amountOk && refOk) {
        passed++;
        console.log('  ✅ PASSED\n');
    } else {
        console.log('  ❌ FAILED\n');
    }
});

console.log(`📊 Results: ${passed}/${tests.length} passed (${(passed / tests.length * 100).toFixed(0)}% accuracy)\n`);
