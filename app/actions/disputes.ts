'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Flag an audit log entry for review
 */
export async function flagAuditEntry(auditLogId: string, reason: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    try {
        // Get user's database ID
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!dbUser) {
            return { success: false, error: 'User not found' };
        }

        // Check if audit log exists and get family ID
        const auditLog = await prisma.auditLog.findUnique({
            where: { id: auditLogId },
            select: { familyId: true }
        });

        if (!auditLog) {
            return { success: false, error: 'Audit log not found' };
        }

        // Create the dispute/flag
        const dispute = await prisma.auditDispute.create({
            data: {
                auditLogId,
                raisedBy: dbUser.id,
                reason,
                status: 'OPEN',
            },
        });

        revalidatePath(`/dashboard/${auditLog.familyId}/settings`);

        return { success: true, data: dispute };
    } catch (error: any) {
        console.error('Error flagging audit entry:', error);
        return { success: false, error: error.message || 'Failed to flag audit entry' };
    }
}

/**
 * Open a formal dispute on an audit log entry
 */
export async function openDispute(auditLogId: string, reason: string) {
    // Same as flagAuditEntry for now, but could have different workflow
    return flagAuditEntry(auditLogId, reason);
}

/**
 * Respond to a dispute (Treasurer/President only)
 */
export async function respondToDispute(disputeId: string, response: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    try {
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!dbUser) {
            return { success: false, error: 'User not found' };
        }

        // Get the dispute and check permissions
        const dispute = await prisma.auditDispute.findUnique({
            where: { id: disputeId },
            include: {
                auditLog: { select: { familyId: true } }
            }
        });

        if (!dispute) {
            return { success: false, error: 'Dispute not found' };
        }

        // Check if user has permission (President or Treasurer)
        const member = await prisma.familyMember.findUnique({
            where: {
                familyId_userId: {
                    familyId: dispute.auditLog.familyId,
                    userId: dbUser.id
                }
            }
        });

        if (!member || !['PRESIDENT', 'TREASURER'].includes(member.role)) {
            return { success: false, error: 'Insufficient permissions' };
        }

        // Update the dispute
        const updatedDispute = await prisma.auditDispute.update({
            where: { id: disputeId },
            data: {
                response,
                status: 'RESPONDED',
            },
        });

        revalidatePath(`/dashboard/${dispute.auditLog.familyId}/settings`);

        return { success: true, data: updatedDispute };
    } catch (error: any) {
        console.error('Error responding to dispute:', error);
        return { success: false, error: error.message || 'Failed to respond to dispute' };
    }
}

/**
 * Resolve a dispute (President only)
 */
export async function resolveDispute(
    disputeId: string,
    resolution: string,
    status: 'RESOLVED' | 'DISMISSED'
) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    try {
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!dbUser) {
            return { success: false, error: 'User not found' };
        }

        // Get the dispute
        const dispute = await prisma.auditDispute.findUnique({
            where: { id: disputeId },
            include: {
                auditLog: { select: { familyId: true } }
            }
        });

        if (!dispute) {
            return { success: false, error: 'Dispute not found' };
        }

        // Check if user is President
        const member = await prisma.familyMember.findUnique({
            where: {
                familyId_userId: {
                    familyId: dispute.auditLog.familyId,
                    userId: dbUser.id
                }
            }
        });

        if (!member || member.role !== 'PRESIDENT') {
            return { success: false, error: 'Only the President can resolve disputes' };
        }

        // Update the dispute
        const updatedDispute = await prisma.auditDispute.update({
            where: { id: disputeId },
            data: {
                resolution,
                status,
                resolvedBy: dbUser.id,
                resolvedAt: new Date(),
            },
        });

        revalidatePath(`/dashboard/${dispute.auditLog.familyId}/settings`);

        return { success: true, data: updatedDispute };
    } catch (error: any) {
        console.error('Error resolving dispute:', error);
        return { success: false, error: error.message || 'Failed to resolve dispute' };
    }
}

/**
 * Get disputes for an audit log entry
 */
export async function getDisputesForAuditLog(auditLogId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    try {
        const disputes = await prisma.auditDispute.findMany({
            where: { auditLogId },
            include: {
                raiser: {
                    select: { id: true, fullName: true, email: true }
                },
                resolver: {
                    select: { id: true, fullName: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: disputes };
    } catch (error: any) {
        console.error('Error getting disputes:', error);
        return { success: false, error: error.message || 'Failed to get disputes' };
    }
}
