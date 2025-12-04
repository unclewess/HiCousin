"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Home',
            href: '/dashboard',
            icon: Home,
            activePattern: /^\/dashboard$/, // Exact match for dashboard home
        },
        {
            label: 'Contribute',
            href: '/dashboard/contribute', // Assuming this route exists or will exist
            icon: PlusCircle,
            activePattern: /^\/dashboard\/contribute/,
        },
        {
            label: 'Members',
            href: '/dashboard/members', // Assuming this route exists or will exist
            icon: Users,
            activePattern: /^\/dashboard\/members/,
        },
        {
            label: 'Profile',
            href: '/dashboard/profile', // Assuming this route exists or will exist
            icon: User,
            activePattern: /^\/dashboard\/profile/,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe md:hidden z-50 shadow-lg">
            <div className="flex justify-around items-center h-20 px-2">
                {navItems.map((item) => {
                    const isActive = item.activePattern.test(pathname || '');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[64px] min-h-[56px] rounded-xl transition-all duration-200",
                                "active:scale-95",
                                isActive
                                    ? "text-cousin-purple bg-cousin-purple/10"
                                    : "text-gray-mid hover:text-gray-dark hover:bg-gray-100"
                            )}
                        >
                            <Icon
                                size={26}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    "transition-all duration-200 mb-1",
                                    isActive && "scale-110"
                                )}
                            />
                            <span className={cn(
                                "text-[11px] font-medium",
                                isActive && "font-semibold"
                            )}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
