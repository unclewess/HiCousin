'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions/check";
import { PERMISSIONS } from "@/lib/permissions";

export interface MemberOption {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
}

/**
 * Fetch active family members for beneficiary selection
 */
export async function getFamilyMembers(familyId: string): Promise<MemberOption[]> {
    // Verify permission (implicitly checks auth and membership)
    await requirePermission(familyId, PERMISSIONS.VIEW_MEMBERS);

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
