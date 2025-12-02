import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <DashboardHeader />

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
