import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('👻 Starting Ghost Town Simulation...');

    // 1. Setup: Create a test family and user
    const testFamilyName = `GhostTest-${Date.now()}`;
    const testUserEmail = `ghost-${Date.now()}@example.com`;
    const testClerkId = `user_ghost_${Date.now()}`;

    console.log(`Creating Family: ${testFamilyName}`);
    const family = await prisma.family.create({
        data: {
            name: testFamilyName,
            code: `GT-${Date.now().toString().slice(-6)}`,
        }
    });

    console.log(`Creating User: ${testUserEmail}`);
    const user = await prisma.user.create({
        data: {
            clerkId: testClerkId,
            email: testUserEmail,
            fullName: 'Casper the Ghost',
        }
    });

    console.log('Adding user to family...');
    await prisma.familyMember.create({
        data: {
            familyId: family.id,
            userId: user.id,
            role: 'MEMBER'
        }
    });

    // 2. Verify Ghost Status (No contributions)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const contributionsThisMonth = await prisma.contribution.count({
        where: {
            familyId: family.id,
            userId: user.id,
            contributionMonth: startOfMonth
        }
    });

    if (contributionsThisMonth === 0) {
        console.log('✅ PASS: User correctly identified as a Ghost (0 contributions this month).');
    } else {
        console.error('❌ FAIL: User has contributions but shouldn\'t.');
    }

    // 3. Simulate Backdated Payment (Last Month)
    console.log('Recording payment for LAST month...');
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    await prisma.contribution.create({
        data: {
            familyId: family.id,
            userId: user.id,
            amount: 100,
            shares: 1,
            contributionMonth: lastMonth,
            status: 'PAID',
            paidAt: lastMonth
        }
    });

    // 4. Verify Ghost Status AGAIN (Should still be a ghost for THIS month)
    const contributionsThisMonthAfterBackdate = await prisma.contribution.count({
        where: {
            familyId: family.id,
            userId: user.id,
            contributionMonth: startOfMonth
        }
    });

    if (contributionsThisMonthAfterBackdate === 0) {
        console.log('✅ PASS: User still a Ghost this month after paying for last month.');
    } else {
        console.error('❌ FAIL: Backdated payment incorrectly counted for this month.');
    }

    // Cleanup
    console.log('Cleaning up...');
    await prisma.contribution.deleteMany({ where: { familyId: family.id } });
    await prisma.familyMember.deleteMany({ where: { familyId: family.id } });
    await prisma.family.delete({ where: { id: family.id } });
    await prisma.user.delete({ where: { id: user.id } });

    console.log('👻 Simulation Complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
