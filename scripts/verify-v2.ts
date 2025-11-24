import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock auth by overriding the global fetch or just mocking the module?
// Since we can't easily mock `auth()` in a standalone script without a lot of setup,
// we will simulate the DB operations directly or use a test helper if possible.
// Actually, `app/actions.ts` uses `auth()` which will fail in a script.
// We need to modify `app/actions.ts` to allow bypassing auth for testing, OR
// we just test the Prisma operations directly here to verify the schema and relationships.

// Let's test the Schema and Relationships directly.

async function main() {
    console.log("Starting V2 Verification...");

    // 1. Create a Test User and Family
    const testUser = await prisma.user.upsert({
        where: { clerkId: "test_v2_user" },
        update: {},
        create: {
            clerkId: "test_v2_user",
            email: "testv2@example.com",
            fullName: "Test V2 User"
        }
    });

    const family = await prisma.family.create({
        data: {
            name: "V2 Test Family",
            code: "V2TEST",
            createdBy: testUser.id,
            members: {
                create: {
                    userId: testUser.id,
                    role: "PRESIDENT",
                    status: "ACTIVE"
                }
            }
        }
    });

    console.log(`Created Family: ${family.name} (${family.id})`);

    // 2. Create a Campaign
    const campaign = await prisma.campaign.create({
        data: {
            familyId: family.id,
            name: "Holiday Fund",
            targetAmount: 1000,
            minContribution: 50,
            status: "ACTIVE",
            type: "ADHOC"
        }
    });

    console.log(`Created Campaign: ${campaign.name} (${campaign.id})`);

    // 3. Add a Participant (The President)
    await prisma.campaignParticipant.create({
        data: {
            campaignId: campaign.id,
            familyMemberId: (await prisma.familyMember.findFirst({ where: { familyId: family.id } }))!.id
        }
    });

    console.log("Added Participant");

    // 4. Record a Payment for the Campaign
    const contribution = await prisma.contribution.create({
        data: {
            familyId: family.id,
            userId: testUser.id,
            amount: 100,
            shares: 1,
            contributionMonth: new Date(),
            status: "PAID",
            campaignId: campaign.id,
            paidAt: new Date()
        }
    });

    console.log(`Recorded Contribution: $${contribution.amount} for Campaign ${campaign.id}`);

    // 5. Verify Data Retrieval (Simulating Reports Logic)
    const fetchedCampaign = await prisma.campaign.findUnique({
        where: { id: campaign.id },
        include: { contributions: true }
    });

    const totalCollected = fetchedCampaign?.contributions.reduce((sum, c) => sum + Number(c.amount), 0);

    console.log(`Total Collected for Campaign: $${totalCollected}`);

    if (totalCollected === 100) {
        console.log("SUCCESS: Campaign collection verified.");
    } else {
        console.error("FAILURE: Campaign collection mismatch.");
    }

    // Cleanup
    await prisma.contribution.deleteMany({ where: { familyId: family.id } });
    await prisma.campaignParticipant.deleteMany({ where: { campaignId: campaign.id } });
    await prisma.campaign.deleteMany({ where: { familyId: family.id } });
    await prisma.familyMember.deleteMany({ where: { familyId: family.id } });
    await prisma.family.delete({ where: { id: family.id } });
    await prisma.user.delete({ where: { id: testUser.id } });

    console.log("Cleanup complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
