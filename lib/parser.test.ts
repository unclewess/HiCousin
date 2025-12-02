/**
 * Parser Test Suite
 * Tests message parser against real M-Pesa samples
 */

import { parseMessage, isValidParsedMessage } from './parser';

// Real M-Pesa samples from user
const TEST_MESSAGES = [
    {
        name: 'M-Pesa Send to Person',
        message: 'TKT95BDMTY Confirmed. Ksh1,000.00 sent to ARNOLD  TEZI 0799174938 on 29/11/25 at 2:24 PM. New M-PESA balance is Ksh15,647.18. Transaction cost, Ksh13.00.  Amount you can transact within the day is 488,353.70. Earn interest daily on Ziidi MMF,Dial *334#',
        expected: {
            amount: 1000.00,
            reference: 'TKT95BDMTY',
            date: new Date(2025, 10, 29, 14, 24), // Nov 29, 2025, 2:24 PM
            channel: 'MPESA',
        },
    },
    {
        name: 'M-Pesa Send to Organization',
        message: 'TKT95BCZ9V Confirmed. Ksh10,253.00 sent to CIC Money Market Fund for account 00001-001-124004-002 on 29/11/25 at 10:41 AM New M-PESA balance is Ksh17,053.48. Transaction cost, Ksh57.00.Amount you can transact within the day is 489,747.00. Save frequent paybills for quick payment on M-PESA app https://bit.ly/mpesalnk',
        expected: {
            amount: 10253.00,
            reference: 'TKT95BCZ9V',
            date: new Date(2025, 10, 29, 10, 41), // Nov 29, 2025, 10:41 AM
            channel: 'MPESA',
        },
    },
    {
        name: 'M-Pesa Send to SACCO',
        message: 'TKS95BC8CO Confirmed. Ksh2,000.00 sent to AMREF SACCO for account 8238-DEP on 28/11/25 at 9:47 PM New M-PESA balance is Ksh27,363.48. Transaction cost, Ksh20.00.Amount you can transact within the day is 494,141.00. Save frequent paybills for quick payment on M-PESA app https://bit.ly/mpesalnk',
        expected: {
            amount: 2000.00,
            reference: 'TKS95BC8CO',
            date: new Date(2025, 10, 28, 21, 47), // Nov 28, 2025, 9:47 PM
            channel: 'MPESA',
        },
    },
    {
        name: 'M-Pesa Send Small Amount',
        message: 'TKR95B76IO Confirmed. Ksh1,730.00 sent to MATHEW  KOMEN 0704167779 on 27/11/25 at 3:49 PM. New M-PESA balance is Ksh2,408.48. Transaction cost, Ksh33.00.  Amount you can transact within the day is 497,915.00. Earn interest daily on Ziidi MMF,Dial *334#',
        expected: {
            amount: 1730.00,
            reference: 'TKR95B76IO',
            date: new Date(2025, 10, 27, 15, 49), // Nov 27, 2025, 3:49 PM
            channel: 'MPESA',
        },
    },
    {
        name: 'M-Pesa Send Very Small Amount',
        message: 'TKR95B5UK3 Confirmed. Ksh355.00 sent to SHEILA  OPONDO 0705424188 on 27/11/25 at 8:14 AM. New M-PESA balance is Ksh4,171.48. Transaction cost, Ksh7.00.  Amount you can transact within the day is 499,645.00. Earn interest daily on Ziidi MMF,Dial *334#',
        expected: {
            amount: 355.00,
            reference: 'TKR95B5UK3',
            date: new Date(2025, 10, 27, 8, 14), // Nov 27, 2025, 8:14 AM
            channel: 'MPESA',
        },
    },
];

/**
 * Run all tests and log results
 */
export function runParserTests() {
    console.log('🧪 Running Parser Tests...\n');

    let passed = 0;
    let failed = 0;

    TEST_MESSAGES.forEach((test, index) => {
        console.log(`Test ${index + 1}: ${test.name}`);
        const result = parseMessage(test.message);

        // Check amount
        const amountMatch = result.amount === test.expected.amount;
        console.log(`  Amount: ${result.amount} ${amountMatch ? '✅' : '❌ Expected: ' + test.expected.amount}`);

        // Check reference
        const refMatch = result.reference === test.expected.reference;
        console.log(`  Reference: ${result.reference} ${refMatch ? '✅' : '❌ Expected: ' + test.expected.reference}`);

        // Check date (compare timestamps)
        const dateMatch = result.date?.getTime() === test.expected.date.getTime();
        console.log(`  Date: ${result.date?.toISOString()} ${dateMatch ? '✅' : '❌ Expected: ' + test.expected.date.toISOString()}`);

        // Check channel
        const channelMatch = result.channel === test.expected.channel;
        console.log(`  Channel: ${result.channel} ${channelMatch ? '✅' : '❌ Expected: ' + test.expected.channel}`);

        // Check confidence
        console.log(`  Confidence: ${result.confidence.toFixed(2)}`);

        // Check validity
        const isValid = isValidParsedMessage(result);
        console.log(`  Valid: ${isValid ? '✅' : '❌'}`);

        const testPassed = amountMatch && refMatch && dateMatch && channelMatch && isValid;
        if (testPassed) {
            passed++;
            console.log(`  ✅ PASSED\n`);
        } else {
            failed++;
            console.log(`  ❌ FAILED\n`);
        }
    });

    console.log(`\n📊 Results: ${passed}/${TEST_MESSAGES.length} passed, ${failed} failed`);
    console.log(`Accuracy: ${((passed / TEST_MESSAGES.length) * 100).toFixed(1)}%\n`);

    return { passed, failed, total: TEST_MESSAGES.length };
}

// Auto-run if executed directly
if (require.main === module) {
    runParserTests();
}
