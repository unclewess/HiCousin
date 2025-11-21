import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected successfully.');

        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        await prisma.$disconnect();
    } catch (e) {
        console.error('Database connection failed:', e);
        process.exit(1);
    }
}

main();
