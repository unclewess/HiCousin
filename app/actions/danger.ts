/**
 * Danger Action Server Actions
 * 
 * Handles critical actions that require dual approval or emergency override.
 * Implements cooling periods and comprehensive audit logging.
 */

'use server';

import prisma from '@/lib/db';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions';
import { auditDangerAction } from '@/lib/audit/logger';
import { sendNotification, sendBulkNotification, NotificationTemplates } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

/**
 * Create a danger action
 * 
 * @param familyId - Family ID
 * @param actionType - Type of action (e.g., 'delete_group', 'override_contribution')
 * @param payload - Action payload (what will be changed)
 * @param reason - Reason for the action
 * @returns Created danger action
 */
export async function createDangerAction(
    familyId: string,
    actionType: string,
    payload: any,
    reason: string
) {
    try {
        const { userId, role } = await requirePermission(familyId, PERMISSIONS.PERFORM_DANGER_ACTION);

        // Determine required approvals based on action type
        const requiredApprovals = await getRequiredApprovals(familyId, actionType, userId);

        if (requiredApprovals.length === 0) {
            return {
                success: false,
                error: 'No approvers available for this action',
            };
        }

        // Create danger action
        const dangerAction = await prisma.dangerAction.create({
            data: {
                familyId,
                actionType,
                payload,
                requestedBy: userId,
                requiredApprovals,
                reason,
                status: 'PENDING',
            },
        });

        // Create audit log
        await auditDangerAction(
            dangerAction.id,
            familyId,
            'CREATED',
            userId,
            role,
            undefined,
            dangerAction,
            reason
        );

        // Notify approvers
        await notifyApprovers(dangerAction, requiredApprovals);

        return {
            success: true,
            data: dangerAction,
        };
    } catch (error: any) {
        console.error('Error creating danger action:', error);
        return {
            success: false,
            error: error.message || 'Failed to create danger action',
        };
    }
}

/**
 * Approve a danger action
 * 
 * @param dangerActionId - Danger action ID
 * @param approvalReason - Reason for approval
 * @returns Updated danger action
 */
export async function approveDangerAction(
    dangerActionId: string,
    approvalReason?: string
) {
    try {
        const action = await prisma.dangerAction.findUnique({
            where: { id: dangerActionId },
        });

        if (!action) {
            return { success: false, error: 'Danger action not found' };
        }

        if (action.status !== 'PENDING') {
            return { success: false, error: `Action is already ${action.status.toLowerCase()}` };
        }

        const { userId, role } = await requirePermission(action.familyId, PERMISSIONS.ACCESS_DANGER_ZONE);

        // Check if user is required approver
        const requiredApprovals = action.requiredApprovals as any[];
        const isRequiredApprover = requiredApprovals.some(
            (req: any) => req.role === role || req.userId === userId
        );

        if (!isRequiredApprover) {
            return {
                success: false,
                error: 'You are not authorized to approve this action',
            };
        }

        // Check if user already approved
        const existingApprovals = Array.isArray(action.approvals) ? action.approvals : [];
        const alreadyApproved = existingApprovals.some((app: any) => app.userId === userId);

        if (alreadyApproved) {
            return {
                success: false,
                error: 'You have already approved this action',
            };
        }

        // Add approval
        const approvals = [
            ...existingApprovals,
            {
                userId,
                role,
                approvedAt: new Date().toISOString(),
                reason: approvalReason,
            },
        ];

        // Check if all approvals met
        const allApproved = requiredApprovals.every((req: any) =>
            approvals.some((app: any) => app.role === req.role || app.userId === req.userId)
        );

        const status = allApproved ? 'APPROVED' : 'PENDING';
        const coolingEndsAt = allApproved
            ? new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
            : null;

        const updated = await prisma.dangerAction.update({
            where: { id: dangerActionId },
            data: {
                approvals,
                status,
                coolingEndsAt,
            },
        });

        // Create audit log
        await auditDangerAction(
            dangerActionId,
            action.familyId,
            'APPROVED',
            userId,
            role,
            action,
            updated,
            approvalReason
        );

        // Notify requester
        await sendNotification({
            userId: action.requestedBy,
            familyId: action.familyId,
            type: 'DANGER_ACTION_APPROVED',
            title: allApproved ? 'Action Fully Approved' : 'Action Partially Approved',
            message: allApproved
                ? `Your ${action.actionType} request has been fully approved and will execute after the cooling period`
                : `Your ${action.actionType} request has been approved by ${role}`,
            priority: 'HIGH',
            channels: ['in_app'],
            actionUrl: `/dashboard/${action.familyId}/settings/danger-zone`,
        });

        if (allApproved) {
            // TODO: Schedule execution after cooling period
            // For now, just log it
            console.log(`Danger action ${dangerActionId} approved. Will execute after cooling period.`);
        }

        revalidatePath(`/dashboard/${action.familyId}/settings`);

        return {
            success: true,
            data: updated,
            allApproved,
        };
    } catch (error: any) {
        console.error('Error approving danger action:', error);
        return {
            success: false,
            error: error.message || 'Failed to approve danger action',
        };
    }
}

/**
 * Reject a danger action
 * 
 * @param dangerActionId - Danger action ID
 * @param rejectionReason - Reason for rejection
 * @returns Updated danger action
 */
export async function rejectDangerAction(
    dangerActionId: string,
    rejectionReason: string
) {
    try {
        const action = await prisma.dangerAction.findUnique({
            where: { id: dangerActionId },
        });

        if (!action) {
            return { success: false, error: 'Danger action not found' };
        }

        if (action.status !== 'PENDING') {
            return { success: false, error: `Action is already ${action.status.toLowerCase()}` };
        }

        const { userId, role } = await requirePermission(action.familyId, PERMISSIONS.ACCESS_DANGER_ZONE);

        const updated = await prisma.dangerAction.update({
            where: { id: dangerActionId },
            data: {
                status: 'REJECTED',
                reason: rejectionReason,
            },
        });

        // Create audit log
        await auditDangerAction(
            dangerActionId,
            action.familyId,
            'REJECTED',
            userId,
            role,
            action,
            updated,
            rejectionReason
        );

        // Notify requester
        await sendNotification({
            userId: action.requestedBy,
            familyId: action.familyId,
            type: 'DANGER_ACTION_REJECTED',
            title: 'Action Rejected',
            message: `Your ${action.actionType} request was rejected. Reason: ${rejectionReason}`,
            priority: 'HIGH',
            channels: ['in_app'],
            actionUrl: `/dashboard/${action.familyId}/settings/danger-zone`,
        });

        revalidatePath(`/dashboard/${action.familyId}/settings`);

        return {
            success: true,
            data: updated,
        };
    } catch (error: any) {
        console.error('Error rejecting danger action:', error);
        return {
            success: false,
            error: error.message || 'Failed to reject danger action',
        };
    }
}

/**
 * Execute a danger action (after cooling period)
 * 
 * This should be called by a scheduled job after the cooling period ends
 * 
 * @param dangerActionId - Danger action ID
 * @returns Execution result
 */
export async function executeDangerAction(dangerActionId: string) {
    try {
        const action = await prisma.dangerAction.findUnique({
            where: { id: dangerActionId },
        });

        if (!action) {
            return { success: false, error: 'Danger action not found' };
        }

        if (action.status !== 'APPROVED') {
            return { success: false, error: 'Action is not approved' };
        }

        if (action.coolingEndsAt && new Date() < action.coolingEndsAt) {
            return { success: false, error: 'Cooling period has not ended yet' };
        }

        // Execute the action based on type
        const executionResult = await executeActionByType(action);

        if (!executionResult.success) {
            return executionResult;
        }

        // Mark as executed
        const updated = await prisma.dangerAction.update({
            where: { id: dangerActionId },
            data: {
                status: 'EXECUTED',
                executedAt: new Date(),
                executedBy: 'SYSTEM', // Or pass userId if manually triggered
            },
        });

        // Create audit log
        await auditDangerAction(
            dangerActionId,
            action.familyId,
            'EXECUTED',
            'SYSTEM',
            'SYSTEM',
            action,
            updated,
            'Cooling period ended'
        );

        // Notify requester
        await sendNotification({
            userId: action.requestedBy,
            familyId: action.familyId,
            type: 'DANGER_ACTION_EXECUTED',
            title: 'Action Executed',
            message: `Your ${action.actionType} request has been executed`,
            priority: 'HIGH',
            channels: ['in_app'],
        });

        return {
            success: true,
            data: updated,
        };
    } catch (error: any) {
        console.error('Error executing danger action:', error);
        return {
            success: false,
            error: error.message || 'Failed to execute danger action',
        };
    }
}

/**
 * Get pending danger actions for a family
 * 
 * @param familyId - Family ID
 * @returns Array of pending danger actions
 */
export async function getPendingDangerActions(familyId: string) {
    try {
        await requirePermission(familyId, PERMISSIONS.ACCESS_DANGER_ZONE);

        const actions = await prisma.dangerAction.findMany({
            where: {
                familyId,
                status: { in: ['PENDING', 'APPROVED'] },
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return {
            success: true,
            data: actions,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to get danger actions',
        };
    }
}

/**
 * Helper: Get required approvals for an action type
 */
async function getRequiredApprovals(familyId: string, actionType: string, requesterId: string) {
    // Get President and Treasurer (excluding requester)
    const approvers = await prisma.familyMember.findMany({
        where: {
            familyId,
            role: { in: ['PRESIDENT', 'TREASURER'] },
            status: 'ACTIVE',
            userId: { not: requesterId }, // Exclude requester
        },
        select: {
            userId: true,
            role: true,
        },
    });

    return approvers.map(a => ({ userId: a.userId, role: a.role }));
}

/**
 * Helper: Notify approvers
 */
async function notifyApprovers(dangerAction: any, approvers: any[]) {
    const userIds = approvers.map((a: { userId: string; role: string }) => a.userId);

    await sendBulkNotification(userIds, {
        familyId: dangerAction.familyId,
        ...NotificationTemplates.DANGER_ACTION_PENDING(dangerAction.actionType),
        actionUrl: `/dashboard/${dangerAction.familyId}/settings/danger-zone/${dangerAction.id}`,
        metadata: { dangerActionId: dangerAction.id },
    });
}

/**
 * Helper: Execute action by type
 */
async function executeActionByType(action: any) {
    // TODO: Implement actual execution logic for each action type
    switch (action.actionType) {
        case 'update_critical_settings':
            // Update settings with payload
            console.log('Executing settings update:', action.payload);
            return { success: true };

        case 'delete_group':
            // Delete group
            console.log('Executing group deletion:', action.familyId);
            return { success: true };

        case 'override_contribution':
            // Override contribution
            console.log('Executing contribution override:', action.payload);
            return { success: true };

        case 'reset_leaderboard':
            // Reset leaderboard
            console.log('Executing leaderboard reset:', action.familyId);
            return { success: true };

        default:
            return { success: false, error: `Unknown action type: ${action.actionType}` };
    }
}
