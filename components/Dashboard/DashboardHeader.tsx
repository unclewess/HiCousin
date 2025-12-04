'use client';

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getFamilyName } from "@/app/actions/getFamilyName";
import { ChevronRight, Home } from "lucide-react";
import { NotificationCenter } from "@/components/Notifications/NotificationCenter";

export function DashboardHeader() {
    const params = useParams();
    const familyId = params?.familyId as string | undefined;
    const [familyName, setFamilyName] = useState<string | null>(null);

    useEffect(() => {
        if (familyId) {
            getFamilyName(familyId).then(setFamilyName);
        } else {
            setFamilyName(null);
        }
    }, [familyId]);

    return (
        <>
            {/* Desktop Header */}
            <nav className="bg-white shadow-sm hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-2xl font-bold text-cousin-purple font-fun hover:opacity-80 transition-opacity">
                                hiCousins
                            </Link>

                            {familyName && (
                                <>
                                    <ChevronRight className="text-gray-300" />
                                    <Link
                                        href={`/dashboard/${familyId}`}
                                        className="text-lg font-semibold text-gray-dark hover:text-cousin-blue transition-colors flex items-center gap-2"
                                    >
                                        <Home size={18} className="mb-0.5" />
                                        {familyName}
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/families">
                                <Button variant="secondary" size="sm">
                                    Switch Family
                                </Button>
                            </Link>
                            <NotificationCenter familyId={familyId} />
                            <UserButton showName />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Header */}
            <nav className="bg-white shadow-sm md:hidden sticky top-0 z-40">
                <div className="px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-xl font-bold text-cousin-purple font-fun">
                            hiCousins
                        </Link>
                        {familyName && (
                            <>
                                <ChevronRight className="text-gray-300 w-4 h-4" />
                                <Link
                                    href={`/dashboard/${familyId}`}
                                    className="text-sm font-semibold text-gray-dark truncate max-w-[120px]"
                                >
                                    {familyName}
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationCenter familyId={familyId} />
                        <UserButton />
                    </div>
                </div>
            </nav>
        </>
    );
}
