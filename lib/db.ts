import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    console.log('Initializing Prisma Client...');
    // Log masked URL to verify it's loaded
    const url = process.env.DATABASE_URL;
    if (url) {
        console.log('DATABASE_URL is set:', url.substring(0, 15) + '...');
    } else {
        console.error('DATABASE_URL is MISSING');
    }
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
