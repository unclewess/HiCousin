/**
 * Notification Service
 * 
 * Handles creating and managing in-app notifications.
 * WhatsApp and email channels will be added in future phases.
 */

import prisma from '@/lib/db';

export interface NotificationInput {
    userId: string;
    familyId?: string;
    type: string;
    title: string;
    message: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    channels?: ('in_app' | 'whatsapp' | 'email')[];
    actionUrl?: string;
    metadata?: any;
}

/**
 * Send a notification to a user
 * 
 * @param input - Notification data
 * @returns Created notification
 */
export async function sendNotification(input: NotificationInput) {
    try {
        const notification = await prisma.notificationQueue.create({
            data: {
                userId: input.userId,
                familyId: input.familyId,
                type: input.type,
                title: input.title,
                message: input.message,
                priority: input.priority || 'NORMAL',
                channels: input.channels || ['in_app'],
                actionUrl: input.actionUrl,
                metadata: input.metadata,
                sentAt: new Date(), // Mark as sent immediately for in-app
            },
        });

        // TODO: Process other channels (WhatsApp, email) in future phases
        const channels = input.channels || ['in_app'];
        for (const channel of channels) {
            if (channel === 'whatsapp') {
                // await sendWhatsAppNotification(notification);
                console.log('[Future] WhatsApp notification:', notification.id);
            } else if (channel === 'email') {
                // await sendEmailNotification(notification);
                console.log('[Future] Email notification:', notification.id);
            }
        }

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

/**
 * Send notification to multiple users
 * 
 * @param userIds - Array of user IDs
 * @param notification - Notification data (without userId)
 * @returns Array of created notifications
 */
export async function sendBulkNotification(
    userIds: string[],
    notification: Omit<NotificationInput, 'userId'>
) {
    const notifications = await Promise.all(
        userIds.map(userId => sendNotification({ ...notification, userId }))
    );
    return notifications;
}

/**
 * Get notifications for a user
 * 
 * @param userId - User ID
 * @param options - Query options
 * @returns Array of notifications
 */
export async function getUserNotifications(
    userId: string,
    options?: {
        unreadOnly?: boolean;
        familyId?: string;
        limit?: number;
        offset?: number;
    }
) {
    return prisma.notificationQueue.findMany({
        where: {
            userId,
            ...(options?.unreadOnly && { isRead: false }),
            ...(options?.familyId && { familyId: options.familyId }),
        },
        orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
        ],
        take: options?.limit || 50,
        skip: options?.offset || 0,
    });
}

/**
 * Mark notification as read
 * 
 * @param notificationId - Notification ID
 * @param userId - User ID (for security check)
 * @returns Updated notification
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
    return prisma.notificationQueue.update({
        where: {
            id: notificationId,
            userId, // Ensure user owns the notification
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });
}

/**
 * Mark all notifications as read for a user
 * 
 * @param userId - User ID
 * @param familyId - Optional family ID to scope to specific family
 * @returns Count of updated notifications
 */
export async function markAllAsRead(userId: string, familyId?: string) {
    const result = await prisma.notificationQueue.updateMany({
        where: {
            userId,
            isRead: false,
            ...(familyId && { familyId }),
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });

    return result.count;
}

/**
 * Delete a notification
 * 
 * @param notificationId - Notification ID
 * @param userId - User ID (for security check)
 * @returns Deleted notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
    return prisma.notificationQueue.delete({
        where: {
            id: notificationId,
            userId,
        },
    });
}

/**
 * Get unread notification count
 * 
 * @param userId - User ID
 * @param familyId - Optional family ID
 * @returns Count of unread notifications
 */
export async function getUnreadCount(userId: string, familyId?: string) {
    return prisma.notificationQueue.count({
        where: {
            userId,
            isRead: false,
            ...(familyId && { familyId }),
        },
    });
}

/**
 * Notification Templates
 * 
 * Pre-defined notification templates for common scenarios
 */
export const NotificationTemplates = {
    PROOF_SUBMITTED: (submitterName: string, amount: number) => ({
        type: 'PROOF_SUBMITTED',
        title: 'New Proof Submitted',
        message: `${submitterName} submitted a proof for KES ${amount}`,
        priority: 'NORMAL' as const,
    }),

    PROOF_APPROVED: (amount: number) => ({
        type: 'PROOF_APPROVED',
        title: 'Proof Approved',
        message: `Your proof for KES ${amount} has been approved`,
        priority: 'NORMAL' as const,
    }),

    PROOF_REJECTED: (amount: number, reason: string) => ({
        type: 'PROOF_REJECTED',
        title: 'Proof Rejected',
        message: `Your proof for KES ${amount} was rejected. Reason: ${reason}`,
        priority: 'HIGH' as const,
    }),

    DANGER_ACTION_PENDING: (actionType: string) => ({
        type: 'DANGER_ACTION_PENDING',
        title: 'Action Requires Your Approval',
        message: `A critical action (${actionType}) requires your approval`,
        priority: 'URGENT' as const,
    }),

    EMERGENCY_OVERRIDE: (actionType: string, performedBy: string) => ({
        type: 'EMERGENCY_OVERRIDE',
        title: 'Emergency Override Performed',
        message: `${performedBy} performed an emergency override: ${actionType}`,
        priority: 'URGENT' as const,
    }),

    SETTINGS_UPDATED: (updatedBy: string) => ({
        type: 'SETTINGS_UPDATED',
        title: 'Family Settings Updated',
        message: `${updatedBy} updated the family settings`,
        priority: 'NORMAL' as const,
    }),

    CONTRIBUTION_REMINDER: (amount: number, deadline: string) => ({
        type: 'CONTRIBUTION_REMINDER',
        title: 'Contribution Reminder',
        message: `Your monthly contribution of KES ${amount} is due by ${deadline}`,
        priority: 'HIGH' as const,
    }),
};
