"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export interface BreadcrumbItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
            {/* Home Link */}
            <Link
                href="/"
                className="flex items-center gap-1 text-gray-mid hover:text-cousin-purple transition-colors group"
                aria-label="Home"
            >
                <Home size={16} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Home</span>
            </Link>

            {/* Breadcrumb Items */}
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <Fragment key={item.href}>
                        <ChevronRight size={14} className="text-gray-300" />
                        {isLast ? (
                            <span className="flex items-center gap-1 text-gray-dark font-medium truncate max-w-[150px] sm:max-w-none">
                                {item.icon}
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className="flex items-center gap-1 text-gray-mid hover:text-cousin-purple transition-colors truncate max-w-[100px] sm:max-w-none"
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        )}
                    </Fragment>
                );
            })}
        </nav>
    );
}
