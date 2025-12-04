'use server';

import { auth } from "@clerk/nextjs/server";
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
} from "@/lib/notifications";

/**
 * Get current user's notifications
 */
export async function getMyNotifications(options?: {
    familyId?: string;
    limit?: number;
    offset?: number;
}) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const notifications = await getUserNotifications(userId, {
            familyId: options?.familyId,
            limit: options?.limit,
            offset: options?.offset,
        });

        return { success: true, data: notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, error: "Failed to fetch notifications" };
    }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        await markNotificationAsRead(notificationId, userId);
        return { success: true };
    } catch (error) {
        console.error("Error marking notification read:", error);
        return { success: false, error: "Failed to mark notification as read" };
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(familyId?: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const count = await markAllAsRead(userId, familyId);
        return { success: true, data: { count } };
    } catch (error) {
        console.error("Error marking all notifications read:", error);
        return { success: false, error: "Failed to mark all as read" };
    }
}

/**
 * Delete a notification
 */
export async function removeNotification(notificationId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        await deleteNotification(notificationId, userId);
        return { success: true };
    } catch (error) {
        console.error("Error deleting notification:", error);
        return { success: false, error: "Failed to delete notification" };
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(familyId?: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const count = await getUnreadCount(userId, familyId);
        return { success: true, data: { count } };
    } catch (error) {
        console.error("Error getting unread count:", error);
        return { success: false, error: "Failed to get unread count" };
    }
}
