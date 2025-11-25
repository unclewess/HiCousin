import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Desktop Header */}
            <nav className="bg-white shadow-sm hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/dashboard" className="text-2xl font-bold text-cousin-purple font-fun">
                                    hiCousins
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/families">
                                <Button variant="secondary" size="sm">
                                    Switch Family
                                </Button>
                            </Link>
                            <UserButton showName />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Header */}
            <nav className="bg-white shadow-sm md:hidden sticky top-0 z-40">
                <div className="px-4 h-14 flex items-center justify-between">
                    <Link href="/dashboard" className="text-xl font-bold text-cousin-purple font-fun">
                        hiCousins
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/families" className="text-sm text-gray-mid font-medium hover:text-cousin-purple">
                            Switch
                        </Link>
                        <UserButton />
                    </div>
                </div>
            </nav>

            <main className="py-6 md:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
                        <div className="col-span-4 md:col-span-12">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
