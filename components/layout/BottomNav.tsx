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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe md:hidden z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = item.activePattern.test(pathname || '');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                isActive
                                    ? "text-cousin-green"
                                    : "text-gray-mid hover:text-gray-dark"
                            )}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    "transition-transform duration-200",
                                    isActive && "scale-110"
                                )}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
