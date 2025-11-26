'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function getFamilyName(familyId: string) {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        const family = await prisma.family.findUnique({
            where: { id: familyId },
            select: { name: true }
        });

        return family?.name || null;
    } catch (error) {
        console.error("Error fetching family name:", error);
        return null;
    }
}
