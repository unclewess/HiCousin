'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export interface MemberOption {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
}

/**
 * Fetch active family members for beneficiary selection
 */
export async function getFamilyMembers(familyId: string): Promise<MemberOption[]> {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    // Get database user ID from Clerk ID
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId }
    });

    if (!dbUser) throw new Error("User not found in database");

    // Verify user is in the family
    const membership = await prisma.familyMember.findUnique({
        where: {
            familyId_userId: {
                familyId,
                userId: dbUser.id,
            },
        },
    });

    if (!membership) throw new Error("Not a member of this family");

    // Fetch all active members
    const members = await prisma.familyMember.findMany({
        where: {
            familyId,
            status: 'ACTIVE',
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                    email: true,
                },
            },
        },
        orderBy: {
            user: {
                fullName: 'asc',
            },
        },
    });

    return members.map((m) => ({
        userId: m.userId,
        fullName: m.user.fullName || m.user.email || "Unknown Member",
        avatarUrl: m.user.avatarUrl,
    }));
}
