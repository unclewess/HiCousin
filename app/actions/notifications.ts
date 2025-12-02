"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function getUserNotifications() {
    const { userId } = await auth();
    if (!userId) return [];

    try {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function markNotificationRead(notificationId: string) {
    const { userId } = await auth();
    if (!userId) return;

    try {
        await prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
    } catch (error) {
        console.error("Error marking notification read:", error);
    }
}
