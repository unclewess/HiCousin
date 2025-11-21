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

export async function getUserFamily() {
    let userId: string;
    try {
        userId = await getOrCreateUser();
    } catch (e) {
        return null;
    }

    const membership = await prisma.familyMember.findFirst({
        where: {
            userId: userId,
            status: 'ACTIVE'
        },
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

export async function recordPayment(familyId: string, targetUserId: string, amount: number, date: Date) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        // Verify requester is Admin (President or Treasurer - assuming Treasurer role exists or just President for now)
        // For now, let's assume only President can do this, or we need to check role.
        const requester = await prisma.familyMember.findFirst({
            where: {
                familyId,
                user: { clerkId: userId },
                role: { in: ['PRESIDENT', 'TREASURER'] }
            }
        });

        if (!requester) return { error: "Insufficient permissions" };

        const contributionMonth = new Date(date.getFullYear(), date.getMonth(), 1);

        await prisma.contribution.create({
            data: {
                familyId,
                userId: targetUserId,
                amount,
                shares: 1,
                contributionMonth,
                status: 'PAID',
                paidAt: date,
                verifiedBy: requester.userId
            }
        });

        // Note: We are NOT updating streaks for manual recording yet to avoid complexity with backdating.
        // TODO: Implement streak updates for manual payments if needed.

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Record payment error:", error);
        return { error: "Failed to record payment" };
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
