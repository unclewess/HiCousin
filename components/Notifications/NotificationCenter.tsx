'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    getMyNotifications,
    markAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    getUnreadNotificationCount,
} from '@/app/actions/notifications';
import { useVisibilityPolling } from '@/hooks/useVisibilityPolling';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    isRead: boolean;
    actionUrl?: string;
    createdAt: Date;
}

export const NotificationCenter = React.memo(function NotificationCenter({ familyId }: { familyId?: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load notifications
    const loadNotifications = useCallback(async () => {
        setLoading(true);
        const result = await getMyNotifications({
            familyId,
            limit: 10,
        });

        if (result.success && result.data) {
            setNotifications(result.data as any);
        }
        setLoading(false);
    }, [familyId]);

    // Load unread count
    const loadUnreadCount = useCallback(async () => {
        const result = await getUnreadNotificationCount(familyId);
        if (result.success && result.data) {
            setUnreadCount(result.data.count);
        }
    }, [familyId]);

    // Initial load
    useEffect(() => {
        loadNotifications();
        loadUnreadCount();
    }, [loadNotifications, loadUnreadCount]);

    // Visibility-aware polling - only polls when tab is visible
    useVisibilityPolling(loadUnreadCount, {
        interval: 30000,
        fetchOnFocus: true,
    });

    const handleMarkAsRead = async (notificationId: string) => {
        await markAsRead(notificationId);
        loadNotifications();
        loadUnreadCount();
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead(familyId);
        loadNotifications();
        loadUnreadCount();
    };

    const handleDelete = async (notificationId: string) => {
        await removeNotification(notificationId);
        loadNotifications();
        loadUnreadCount();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return 'text-red-600';
            case 'HIGH':
                return 'text-orange-600';
            case 'NORMAL':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    'p-3 hover:bg-muted/50 transition-colors',
                                    !notification.isRead && 'bg-blue-50/50'
                                )}
                            >
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-medium truncate">
                                                {notification.title}
                                            </h4>
                                            <span
                                                className={cn(
                                                    'text-xs px-1.5 py-0.5 rounded',
                                                    getPriorityColor(notification.priority)
                                                )}
                                            >
                                                {notification.priority}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {!notification.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleDelete(notification.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                {notification.actionUrl && (
                                    <a
                                        href={notification.actionUrl}
                                        className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        View →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});
