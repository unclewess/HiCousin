'use server';

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions/check";
import { PERMISSIONS } from "@/lib/permissions";

export interface CampaignOption {
    id: string;
    name: string;
}

export async function getActiveCampaigns(familyId: string): Promise<CampaignOption[]> {
    try {
        await requirePermission(familyId, PERMISSIONS.VIEW_CAMPAIGNS);

        const campaigns = await prisma.campaign.findMany({
            where: {
                familyId,
                status: 'ACTIVE'
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return campaigns;
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return [];
    }
}
