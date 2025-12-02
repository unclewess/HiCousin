'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getOrCreateUser() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const email = user.emailAddresses[0]?.emailAddress;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { clerkId: userId }
    });

    if (existingUser) {
        return existingUser.id;
    }

    // Create user
    const newUser = await prisma.user.create({
        data: {
            clerkId: userId,
            email: email,
            fullName: user.fullName,
            avatarUrl: user.imageUrl
        }
    });

    return newUser.id;
}

export async function createFamily(formData: FormData) {
    const name = formData.get("name") as string;
    if (!name) throw new Error("Family name is required");

    const userId = await getOrCreateUser();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
        const result = await prisma.$transaction(async (tx) => {
            const family = await tx.family.create({
                data: {
                    name,
                    code,
                    createdBy: userId
                }
            });

            await tx.familyMember.create({
                data: {
                    familyId: family.id,
                    userId: userId,
                    role: 'PRESIDENT',
                    status: 'ACTIVE'
                }
            });

            return family;
        });

        return { success: true, familyId: result.id };
    } catch (error) {
        console.error("Failed to create family:", error);
        return { error: "Failed to create family" };
    }
}

export async function joinFamily(formData: FormData) {
    const code = formData.get("code") as string;
    if (!code) throw new Error("Invite code is required");

    const userId = await getOrCreateUser();

    try {
        const family = await prisma.family.findUnique({
            where: { code }
        });

        if (!family) {
            return { error: "Invalid invite code" };
        }

        const existingMember = await prisma.familyMember.findUnique({
            where: {
                familyId_userId: {
                    familyId: family.id,
                    userId: userId
                }
            }
        });

        if (existingMember) {
            return { error: "Already a member of this family" };
        }

        await prisma.familyMember.create({
            data: {
                familyId: family.id,
                userId: userId,
                role: 'MEMBER',
                status: 'ACTIVE'
            }
        });

        return { success: true, familyId: family.id };
    } catch (error) {
        console.error("Failed to join family:", error);
        return { error: "Failed to join family" };
    }
}

export async function getUserFamily(specificFamilyId?: string) {
    let userId: string;
    try {
        userId = await getOrCreateUser();
    } catch (e) {
        return null;
    }

    const whereClause: any = {
        userId: userId,
        status: 'ACTIVE'
    };

    if (specificFamilyId) {
        whereClause.familyId = specificFamilyId;
    }

    const membership = await prisma.familyMember.findFirst({
        where: whereClause,
        include: {
            family: true
        }
    });

    if (!membership) {
        return null;
    }

    const memberCount = await prisma.familyMember.count({
        where: {
            familyId: membership.familyId,
            status: 'ACTIVE'
        }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const contribution = await prisma.contribution.findFirst({
        where: {
            familyId: membership.familyId,
            userId: userId,
            contributionMonth: startOfMonth
        }
    });

    return {
        family: membership.family,
        user: { id: userId }, // Return minimal user object needed
        role: membership.role,
        memberCount: memberCount,
        contributionStatus: contribution ? contribution.status : 'PENDING',
        contributionAmount: contribution ? Number(contribution.amount) : 0
    };
}

export async function getFamilyMembers(familyId: string) {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        // Verify requester
        const requester = await prisma.familyMember.findFirst({
            where: {
                familyId: familyId,
                user: { clerkId: userId }
            }
        });

        if (!requester) return null;

        const members = await prisma.familyMember.findMany({
            where: { familyId },
            include: { user: true },
            orderBy: { joinedAt: 'asc' }
        });

        return members.map(m => ({
            id: m.user.id,
            full_name: m.user.fullName,
            email: m.user.email,
            avatar_url: m.user.avatarUrl,
            role: m.role,
            status: m.status,
            joined_at: m.joinedAt
        }));
    } catch (error) {
        console.error("Error fetching family members:", error);
        return [];
    }
}

export async function payContribution(familyId: string, amount: number) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return { error: "User not found" };

        const member = await prisma.familyMember.findUnique({
            where: {
                familyId_userId: {
                    familyId: familyId,
                    userId: user.id
                }
            }
        });

        if (!member) return { error: "Not a member of this family" };

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Record Contribution (Always create new)
        await prisma.contribution.create({
            data: {
                familyId,
                userId: user.id,
                amount: amount,
                shares: 1,
                contributionMonth: startOfMonth,
                status: 'PAID',
                paidAt: now
            }
        });

        // 2. Update Streak Logic
        const streak = await prisma.streak.findUnique({
            where: { userId: user.id }
        });

        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        let currentStreak = streak?.currentStreak || 0;
        let longestStreak = streak?.longestStreak || 0;
        let lastContributionMonth = streak?.lastContributionMonth;

        const isFirstThisMonth = !lastContributionMonth || lastContributionMonth < startOfMonth;

        if (isFirstThisMonth) {
            const isConsecutive = lastContributionMonth &&
                lastContributionMonth.getTime() === lastMonth.getTime();

            if (isConsecutive) {
                currentStreak += 1;
            } else {
                currentStreak = 1;
            }

            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }

            // Upsert Streak
            await prisma.streak.upsert({
                where: { userId: user.id },
                update: {
                    currentStreak,
                    longestStreak,
                    lastContributionMonth: startOfMonth
                },
                create: {
                    userId: user.id,
                    currentStreak,
                    longestStreak,
                    lastContributionMonth: startOfMonth
                }
            });
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Payment error:", error);
        return { error: "Failed to process payment" };
    }
}

export async function recordPayment(familyId: string, targetUserId: string, amount: number, date: Date, campaignId?: string) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const requester = await prisma.familyMember.findFirst({
            where: {
                familyId,
                user: { clerkId: userId },
                role: { in: ['PRESIDENT', 'TREASURER'] }
            }
        });

        if (!requester) return { error: "Insufficient permissions" };

        // If it's a campaign payment, just record it directly
        if (campaignId) {
            await prisma.contribution.create({
                data: {
                    familyId,
                    userId: targetUserId,
                    amount,
                    shares: 1,
                    contributionMonth: new Date(date.getFullYear(), date.getMonth(), 1),
                    status: 'PAID',
                    paidAt: date,
                    verifiedBy: requester.userId,
                    campaignId: campaignId
                }
            });
            revalidatePath('/dashboard');
            return { success: true };
        }

        // --- Monthly Fund Logic (Smart Allocation) ---
        const family = await prisma.family.findUnique({ where: { id: familyId } });
        if (!family) return { error: "Family not found" };

        const monthlyMin = Number(family.baseShareValue);
        let remainingAmount = amount;

        // Find the last paid month to determine start
        const lastContribution = await prisma.contribution.findFirst({
            where: {
                familyId,
                userId: targetUserId,
                campaignId: null // Only general fund
            },
            orderBy: { contributionMonth: 'desc' }
        });

        let currentMonth: Date;
        if (lastContribution) {
            // Start from the next month after the last contribution
            currentMonth = new Date(lastContribution.contributionMonth);
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        } else {
            // If no contributions, start from current month
            currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        }

        const batchId = Math.random().toString(36).substring(7);

        // Loop to allocate funds
        while (remainingAmount > 0) {
            const allocation = remainingAmount >= monthlyMin ? monthlyMin : remainingAmount;
            const isFullPayment = allocation >= monthlyMin;

            await prisma.contribution.create({
                data: {
                    familyId,
                    userId: targetUserId,
                    amount: allocation,
                    shares: allocation / monthlyMin,
                    contributionMonth: currentMonth,
                    status: isFullPayment ? 'PAID' : 'PARTIAL',
                    paidAt: date,
                    verifiedBy: requester.userId,
                    notes: `Auto-allocated from $${amount} payment (Batch: ${batchId})`
                }
            });

            remainingAmount -= allocation;

            // Move to next month
            currentMonth = new Date(currentMonth);
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Record payment error:", error);
        return { error: "Failed to record payment" };
    }
}

interface CreateCampaignParams {
    familyId: string;
    name: string;
    description?: string;
    targetAmount?: number;
    minContribution?: number;
    deadline?: Date;
    participantIds?: string[];
}

export async function createCampaign(params: CreateCampaignParams) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const requester = await prisma.familyMember.findFirst({
            where: {
                familyId: params.familyId,
                user: { clerkId: userId },
                role: { in: ['PRESIDENT', 'TREASURER'] }
            }
        });

        if (!requester) return { error: "Insufficient permissions" };

        const campaign = await prisma.campaign.create({
            data: {
                familyId: params.familyId,
                name: params.name,
                description: params.description,
                targetAmount: params.targetAmount ? params.targetAmount : undefined,
                minContribution: params.minContribution ? params.minContribution : undefined,
                deadline: params.deadline ? new Date(params.deadline) : undefined,
                status: 'ACTIVE',
                type: 'ADHOC'
            }
        });

        // Add participants
        if (params.participantIds && params.participantIds.length > 0) {
            const familyMembers = await prisma.familyMember.findMany({
                where: {
                    familyId: params.familyId,
                    userId: { in: params.participantIds }
                }
            });

            await prisma.campaignParticipant.createMany({
                data: familyMembers.map(fm => ({
                    campaignId: campaign.id,
                    familyMemberId: fm.id
                }))
            });
        } else {
            // If no specific participants selected, add ALL active family members
            const allMembers = await prisma.familyMember.findMany({
                where: { familyId: params.familyId, status: 'ACTIVE' }
            });

            await prisma.campaignParticipant.createMany({
                data: allMembers.map(fm => ({
                    campaignId: campaign.id,
                    familyMemberId: fm.id
                }))
            });
        }

        revalidatePath(`/dashboard/${params.familyId}`);
        return { success: true };
    } catch (error) {
        console.error("Create campaign error:", error);
        return { error: "Failed to create campaign" };
    }
}

export async function getFamilyCampaigns(familyId: string) {
    const { userId } = await auth();
    if (!userId) return [];

    try {
        // Verify membership
        const member = await prisma.familyMember.findFirst({
            where: { familyId, user: { clerkId: userId } }
        });
        if (!member) return [];

        // 1. Auto-archive expired campaigns
        const now = new Date();
        await prisma.campaign.updateMany({
            where: {
                familyId,
                status: 'ACTIVE',
                deadline: { lt: now }
            },
            data: { status: 'ARCHIVED' }
        });

        // 2. Fetch active campaigns
        const campaigns = await prisma.campaign.findMany({
            where: {
                familyId,
                status: 'ACTIVE'
            },
            orderBy: { createdAt: 'desc' }
        });

        return campaigns.map(c => ({
            ...c,
            targetAmount: c.targetAmount ? Number(c.targetAmount) : null,
            minContribution: c.minContribution ? Number(c.minContribution) : null
        }));
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return [];
    }
}

export async function getArchivedCampaigns(familyId: string) {
    const { userId } = await auth();
    if (!userId) return {};

    try {
        const campaigns = await prisma.campaign.findMany({
            where: {
                familyId,
                status: 'ARCHIVED'
            },
            include: {
                contributions: {
                    include: { user: true }
                },
                expenses: {
                    orderBy: { date: 'desc' }
                }
            },
            orderBy: { deadline: 'desc' } // Order by deadline (most recent first)
        });

        // Group by Year -> Month
        const grouped: Record<number, Record<string, any[]>> = {};

        campaigns.forEach(c => {
            const date = c.deadline || c.updatedAt; // Use deadline, fallback to update time
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });

            if (!grouped[year]) grouped[year] = {};
            if (!grouped[year][month]) grouped[year][month] = [];

            grouped[year][month].push({
                ...c,
                targetAmount: c.targetAmount ? Number(c.targetAmount) : null,
                minContribution: c.minContribution ? Number(c.minContribution) : null,
                contributions: c.contributions.map((contrib: any) => ({
                    ...contrib,
                    amount: Number(contrib.amount),
                    shares: Number(contrib.shares)
                })),
                expenses: c.expenses.map((exp: any) => ({
                    ...exp,
                    amount: Number(exp.amount)
                }))
            });
        });

        return grouped;
    } catch (error) {
        console.error("Error fetching archived campaigns:", error);
        return {};
    }
}

export async function toggleCampaignStatus(familyId: string, campaignId: string, newStatus: 'ACTIVE' | 'ARCHIVED') {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const requester = await prisma.familyMember.findFirst({
            where: {
                familyId,
                user: { clerkId: userId },
                role: { in: ['PRESIDENT', 'TREASURER'] }
            }
        });

        if (!requester) return { error: "Insufficient permissions" };

        await prisma.campaign.update({
            where: { id: campaignId, familyId },
            data: { status: newStatus }
        });

        revalidatePath(`/dashboard/${familyId}`);
        return { success: true };
    } catch (error) {
        console.error("Error toggling campaign status:", error);
        return { error: "Failed to update campaign status" };
    }
}

export async function getReportsData(familyId: string) {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        // Verify membership
        const member = await prisma.familyMember.findFirst({
            where: { familyId, user: { clerkId: userId } }
        });
        if (!member) return null;

        // 1. Get all contributions (paginated or recent? Let's get recent 50 for now)
        const contributions = await prisma.contribution.findMany({
            where: { familyId },
            include: {
                user: true,
                campaign: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // 2. Get Member Summaries (Total contributed, etc.)
        const members = await prisma.familyMember.findMany({
            where: { familyId },
            include: {
                user: {
                    include: {
                        contributions: {
                            where: { familyId }
                        }
                    }
                }
            }
        });

        const memberSummaries = members.map(m => ({
            id: m.user.id,
            fullName: m.user.fullName,
            avatarUrl: m.user.avatarUrl,
            totalContributed: m.user.contributions.reduce((sum, c) => sum + Number(c.amount), 0),
            role: m.role,
            joinedAt: m.joinedAt
        }));

        // 3. Get Campaign Summaries
        const campaigns = await prisma.campaign.findMany({
            where: { familyId },
            include: {
                contributions: true,
                participants: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const campaignSummaries = campaigns.map(c => ({
            id: c.id,
            name: c.name,
            targetAmount: Number(c.targetAmount),
            collectedAmount: c.contributions.reduce((sum, cont) => sum + Number(cont.amount), 0),
            status: c.status,
            deadline: c.deadline,
            participantCount: c.participants.length
        }));

        return {
            contributions: contributions.map(c => ({
                id: c.id,
                amount: Number(c.amount),
                date: c.paidAt || c.createdAt,
                memberName: c.user.fullName,
                memberAvatar: c.user.avatarUrl,
                campaignName: c.campaign?.name || "General Fund",
                status: c.status
            })),
            memberSummaries,
            campaignSummaries
        };

    } catch (error) {
        console.error("Error fetching reports data:", error);
        return null;
    }
}

export async function getSettingsData(familyId: string) {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        const member = await prisma.familyMember.findFirst({
            where: { familyId, user: { clerkId: userId } },
            include: { family: true }
        });

        if (!member || member.role !== 'PRESIDENT') return null;

        return {
            family: member.family
        };
    } catch (error) {
        console.error("Error fetching settings:", error);
        return null;
    }
}

export async function updateFamilyName(familyId: string, newName: string) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const requester = await prisma.familyMember.findFirst({
            where: { familyId, user: { clerkId: userId }, role: 'PRESIDENT' }
        });

        if (!requester) return { error: "Unauthorized" };

        await prisma.family.update({
            where: { id: familyId },
            data: { name: newName }
        });

        revalidatePath(`/dashboard/${familyId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to update name" };
    }
}

export async function regenerateInviteCode(familyId: string) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const requester = await prisma.familyMember.findFirst({
            where: { familyId, user: { clerkId: userId }, role: 'PRESIDENT' }
        });

        if (!requester) return { error: "Unauthorized" };

        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        await prisma.family.update({
            where: { id: familyId },
            data: { code: newCode }
        });

        revalidatePath(`/dashboard/${familyId}`);
        return { success: true, newCode };
    } catch (error) {
        return { error: "Failed to regenerate code" };
    }
}



export async function assignRole(familyId: string, targetUserId: string, newRole: string) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        // Verify requester is President
        const requester = await prisma.familyMember.findFirst({
            where: {
                familyId,
                user: { clerkId: userId },
                role: 'PRESIDENT'
            }
        });

        if (!requester) return { error: "Only the President can assign roles" };

        await prisma.familyMember.update({
            where: {
                familyId_userId: {
                    familyId,
                    userId: targetUserId
                }
            },
            data: { role: newRole }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Assign role error:", error);
        return { error: "Failed to assign role" };
    }
}

export async function getDashboardData(familyId: string) {
    const { userId } = await auth();
    if (!userId) return null;

    // Verify membership
    const member = await prisma.familyMember.findFirst({
        where: { familyId, user: { clerkId: userId } }
    });
    if (!member) return null;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get Monthly Target
    const target = await prisma.monthlyTarget.findUnique({
        where: {
            familyId_year_month: {
                familyId,
                year: now.getFullYear(),
                month: now.getMonth() + 1 // 1-indexed
            }
        }
    });
    const targetAmount = target ? Number(target.targetAmount) : 5000; // Default 5000

    // Get all members and their contributions for this month
    const members = await prisma.familyMember.findMany({
        where: { familyId, status: 'ACTIVE' },
        include: {
            user: {
                include: {
                    contributions: {
                        where: {
                            familyId,
                            contributionMonth: startOfMonth
                        }
                    },
                    streaks: true
                }
            }
        }
    });

    const memberStats = members.map(m => {
        const totalContribution = m.user.contributions.reduce((sum, c) => sum + Number(c.amount), 0);
        return {
            id: m.user.id,
            fullName: m.user.fullName,
            avatarUrl: m.user.avatarUrl,
            role: m.role,
            totalContribution,
            status: totalContribution > 0 ? 'PAID' : 'PENDING',
            streak: m.user.streaks[0]?.currentStreak || 0
        };
    });

    const contributors = memberStats.filter(m => m.totalContribution > 0);
    const ghosts = memberStats.filter(m => m.totalContribution === 0);
    const totalCollected = contributors.reduce((sum, c) => sum + c.totalContribution, 0);

    return {
        targetAmount,
        totalCollected,
        contributors,
        ghosts,
        currentUserRole: member.role
    };
}

export async function updateMonthlyTarget(familyId: string, amount: number) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const requester = await prisma.familyMember.findFirst({
            where: {
                familyId,
                user: { clerkId: userId },
                role: 'PRESIDENT'
            }
        });

        if (!requester) return { error: "Only the President can set targets" };

        const now = new Date();

        await prisma.monthlyTarget.upsert({
            where: {
                familyId_year_month: {
                    familyId,
                    year: now.getFullYear(),
                    month: now.getMonth() + 1
                }
            },
            update: { targetAmount: amount },
            create: {
                familyId,
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                targetAmount: amount
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Update target error:", error);
        return { error: "Failed to update target" };
    }
}

export async function updateFundSettings(familyId: string, targetAmount: number, minContribution: number) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const requester = await prisma.familyMember.findFirst({
            where: {
                familyId,
                user: { clerkId: userId },
                role: 'PRESIDENT'
            }
        });

        if (!requester) return { error: "Only the President can update settings" };

        const now = new Date();

        // Update Monthly Target
        await prisma.monthlyTarget.upsert({
            where: {
                familyId_year_month: {
                    familyId,
                    year: now.getFullYear(),
                    month: now.getMonth() + 1
                }
            },
            update: { targetAmount },
            create: {
                familyId,
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                targetAmount
            }
        });

        // Update Minimum Contribution (Base Share Value)
        await prisma.family.update({
            where: { id: familyId },
            data: { baseShareValue: minContribution }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Update settings error:", error);
        return { error: "Failed to update settings" };
    }
}

// Expense & Reconciliation Actions

export async function addExpense(data: {
    description: string;
    amount: number;
    date: Date;
    category?: string;
    campaignId?: string;
    familyId: string;
}) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const expense = await prisma.expense.create({
            data: {
                description: data.description,
                amount: data.amount,
                date: data.date,
                category: data.category,
                campaignId: data.campaignId,
                familyId: data.familyId,
                createdBy: userId
            }
        });

        revalidatePath(`/dashboard/${data.familyId}`);
        revalidatePath(`/dashboard/${data.familyId}/history`);
        revalidatePath(`/dashboard/${data.familyId}/general-fund`);

        return { success: true, expense };
    } catch (error) {
        console.error("Error adding expense:", error);
        return { success: false, error: "Failed to add expense" };
    }
}

export async function updateCampaignReconciliation(campaignId: string, notes: string, familyId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { reconciliationNotes: notes }
        });

        revalidatePath(`/dashboard/${familyId}/history`);
        return { success: true };
    } catch (error) {
        console.error("Error updating reconciliation notes:", error);
        return { success: false, error: "Failed to update notes" };
    }
}

export async function getCampaignDetails(familyId: string, campaignId: string) {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId, familyId },
            include: {
                contributions: {
                    where: { status: 'PAID' },
                    include: { user: true }
                },
                expenses: {
                    orderBy: { date: 'desc' }
                },
                participants: {
                    include: { familyMember: { include: { user: true } } }
                }
            }
        });

        if (!campaign) return null;

        const totalCollected = campaign.contributions.reduce((sum, c) => sum + Number(c.amount), 0);
        const totalExpenses = campaign.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

        return {
            ...campaign,
            targetAmount: campaign.targetAmount ? Number(campaign.targetAmount) : null,
            minContribution: campaign.minContribution ? Number(campaign.minContribution) : null,
            totalCollected,
            totalExpenses,
            balance: totalCollected - totalExpenses,
            contributions: campaign.contributions.map((c: any) => ({
                ...c,
                amount: Number(c.amount)
            })),
            participants: campaign.participants.map((p: any) => ({
                id: p.familyMember.user.id,
                fullName: p.familyMember.user.fullName,
                avatarUrl: p.familyMember.user.avatarUrl
            }))
        };
    } catch (error) {
        console.error("Error fetching campaign details:", error);
        return null;
    }
}

export async function getGeneralFundExpenses(familyId: string) {
    const { userId } = await auth();
    if (!userId) return [];

    try {
        const expenses = await prisma.expense.findMany({
            where: {
                familyId,
                campaignId: null // Only general fund expenses
            },
            orderBy: { date: 'desc' }
        });

        return expenses;
    } catch (error) {
        console.error("Error fetching general fund expenses:", error);
        return [];
    }
}

// Helper function to calculate bonus shares for a contribution
async function calculateBonusShares(params: {
    amount: number;
    paymentDate: Date;
    contributionMonth: Date;
    familyId: string;
    userId: string;
}) {
    const { amount, paymentDate, contributionMonth, familyId, userId } = params;

    // Get family settings
    const family = await prisma.family.findUnique({ where: { id: familyId } });
    if (!family) {
        return { baseShares: 0, onTimeBonus: 0, streakBonus: 0, totalShares: 0 };
    }

    const baseShareValue = Number(family.baseShareValue);
    const onTimeBonusPercent = Number(family.onTimeBonusPercent);
    const streakBonusPercent = Number(family.streakBonusPercent);
    const deadlineDay = family.contributionDeadlineDay;

    // Calculate base shares
    const baseShares = amount / baseShareValue;

    // Calculate on-time bonus
    const deadline = new Date(contributionMonth.getFullYear(), contributionMonth.getMonth(), deadlineDay);
    const isOnTime = paymentDate <= deadline;
    const onTimeBonus = isOnTime ? (baseShares * onTimeBonusPercent) / 100 : 0;

    // Get current streak for streak bonus
    const streak = await prisma.streak.findUnique({ where: { userId } });
    const currentStreak = streak?.currentStreak || 0;

    // Streak bonus: 5% per 12 months (cumulative)
    const streakYears = Math.floor(currentStreak / 12);
    const streakBonus = streakYears > 0 ? (baseShares * streakBonusPercent * streakYears) / 100 : 0;

    // Total shares
    const totalShares = baseShares + onTimeBonus + streakBonus;

    return { baseShares, onTimeBonus, streakBonus, totalShares };
}

interface LeaderboardEntry {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    totalShares: number;
    totalAmount: number;
    currentStreak: number;
    rank: number;
    lastContributionStatus: 'early' | 'on-time' | 'late' | 'none';
    joinedAt: Date;
}

export async function getLeaderboardData(
    familyId: string,
    startDate?: Date,
    endDate?: Date,
    includeInactive: boolean = false
) {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        // Get family settings
        const family = await prisma.family.findUnique({ where: { id: familyId } });
        if (!family) return null;

        const deadlineDay = family.contributionDeadlineDay;

        // Default to current month if no date range provided
        const now = new Date();
        const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
        const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get all active members
        const members = await prisma.familyMember.findMany({
            where: { familyId, status: 'ACTIVE' },
            include: {
                user: {
                    include: {
                        contributions: {
                            where: {
                                familyId,
                                campaignId: null, // General fund only
                                contributionMonth: {
                                    gte: start,
                                    lte: end
                                },
                                status: 'PAID'
                            }
                        },
                        streaks: true
                    }
                }
            }
        });

        const leaderboard: LeaderboardEntry[] = [];
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        for (const member of members) {
            const contributions = member.user.contributions;
            const streak = member.user.streaks[0];

            // Calculate totals
            const totalShares = contributions.reduce((sum: number, c: any) => sum + Number(c.shares), 0);
            const totalAmount = contributions.reduce((sum: number, c: any) => sum + Number(c.amount), 0);

            // Determine last contribution status
            let lastStatus: 'early' | 'on-time' | 'late' | 'none' = 'none';
            if (contributions.length > 0) {
                const lastContrib = contributions[contributions.length - 1];
                const deadline = new Date(
                    lastContrib.contributionMonth.getFullYear(),
                    lastContrib.contributionMonth.getMonth(),
                    deadlineDay
                );

                if (lastContrib.paidAt) {
                    if (lastContrib.paidAt < deadline) lastStatus = 'early';
                    else if (lastContrib.paidAt.getTime() === deadline.getTime()) lastStatus = 'on-time';
                    else lastStatus = 'late';
                }
            }

            // Check if inactive (no contribution in current month)
            const hasCurrentMonthContribution = contributions.some((c: any) =>
                c.contributionMonth.getTime() === currentMonthStart.getTime()
            );

            const entry: LeaderboardEntry = {
                userId: member.user.id,
                fullName: member.user.fullName || 'Unknown',
                avatarUrl: member.user.avatarUrl,
                totalShares,
                totalAmount,
                currentStreak: streak?.currentStreak || 0,
                rank: 0, // Will be assigned after sorting
                lastContributionStatus: lastStatus,
                joinedAt: member.joinedAt
            };

            if (hasCurrentMonthContribution || includeInactive) {
                leaderboard.push(entry);
            }
        }

        // Sort and assign ranks
        leaderboard.sort((a, b) => {
            if (b.totalShares !== a.totalShares) return b.totalShares - a.totalShares;
            if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
            return a.joinedAt.getTime() - b.joinedAt.getTime();
        });

        leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        // Separate active and inactive
        const activeMembers = leaderboard.filter(m => {
            const hasCurrentContribution = members.find(fm =>
                fm.user.id === m.userId
            )?.user.contributions.some((c: any) =>
                c.contributionMonth.getTime() === currentMonthStart.getTime()
            );
            return hasCurrentContribution;
        });

        const inactiveMembers = leaderboard.filter(m => !activeMembers.includes(m));

        // Calculate aggregate metrics
        const metrics = {
            totalShares: leaderboard.reduce((sum, m) => sum + m.totalShares, 0),
            totalAmount: leaderboard.reduce((sum, m) => sum + m.totalAmount, 0),
            averageStreak: leaderboard.length > 0
                ? leaderboard.reduce((sum, m) => sum + m.currentStreak, 0) / leaderboard.length
                : 0
        };

        return {
            activeMembers,
            inactiveMembers,
            metrics
        };
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        return null;
    }
}
