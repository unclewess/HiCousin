"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getUserNotifications, markNotificationRead } from "@/app/actions/notifications";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        loadNotifications();
        // Poll every minute
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    async function loadNotifications() {
        const data = await getUserNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    }

    async function handleMarkRead(id: string) {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b bg-gray-50">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 text-sm hover:bg-gray-50 transition-colors cursor-pointer",
                                        !notification.isRead && "bg-blue-50/50"
                                    )}
                                    onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                                >
                                    <p className="text-gray-800">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
