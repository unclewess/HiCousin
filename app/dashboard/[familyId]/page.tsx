import InviteLink from "../InviteLink";
import { getUserFamily, getDashboardData, getFamilyCampaigns } from "../../actions";
import { redirect } from "next/navigation";
import { MemberList } from "@/components/Dashboard/MemberList";
import { GhostTown } from "@/components/Dashboard/GhostTown";
import { RoleManager } from "@/components/Admin/RoleManager";
import { TreasurerPayment } from "@/components/Admin/TreasurerPayment";
import { TargetManager } from "@/components/Admin/TargetManager";
import { CampaignManager } from "@/components/Admin/CampaignManager";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Archive, Settings, FileText, Wallet, Users, TrendingUp } from "lucide-react";

import { ActiveCampaignsList } from "@/components/Dashboard/ActiveCampaignsList";
import { SubmitProofDialog } from "@/components/ProofOfPayment/SubmitProofDialog";
import { TreasurerVerificationSection } from "@/components/ProofOfPayment/TreasurerVerificationSection";
import { DashboardHero } from "@/components/Dashboard/DashboardHero";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

interface PageProps {
    params: Promise<{ familyId: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
    const { familyId } = await params;
    const { userId } = await auth();

    // Verify user is member of THIS family
    const userFamily = await getUserFamily(familyId);

    if (!userFamily) {
        redirect("/families");
    }

    const { family } = userFamily;
    const dashboardData = await getDashboardData(family.id);
    const campaigns = await getFamilyCampaigns(family.id);

    if (!dashboardData) {
        return <div>Failed to load dashboard data.</div>;
    }

    const { targetAmount, totalCollected, contributors, ghosts, currentUserRole } = dashboardData;

    const allMembers = [...contributors, ...ghosts].map(m => ({
        id: m.id,
        fullName: m.fullName,
        avatarUrl: m.avatarUrl,
        role: m.role
    }));

    // Get current user's name
    const currentUser = await auth();
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: currentUser.userId! },
        select: { fullName: true }
    });

    const totalMembers = contributors.length + ghosts.length;
    const monthlyProgress = (totalCollected / targetAmount) * 100;

    return (
        <div className="space-y-8 pb-20">
            {/* Hero Section */}
            <DashboardHero
                familyName={family.name}
                userName={dbUser?.fullName || undefined}
                role={currentUserRole as 'PRESIDENT' | 'TREASURER' | 'MEMBER'}
                stats={{
                    totalMembers,
                    totalCollected,
                    targetAmount,
                    monthlyProgress,
                }}
            />

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <SubmitProofDialog familyId={family.id} />
                <Link href={`/dashboard/${family.id}/general-fund`}>
                    <Button variant="primary" leftIcon={<Wallet size={18} />}>General Fund</Button>
                </Link>
                <Link href={`/dashboard/${family.id}/history`}>
                    <Button variant="outline" leftIcon={<Archive size={18} />}>History</Button>
                </Link>
                <Link href={`/dashboard/${family.id}/reports`}>
                    <Button variant="ghost" leftIcon={<FileText size={18} />}>Reports</Button>
                </Link>
                {currentUserRole === 'PRESIDENT' && (
                    <Link href={`/dashboard/${family.id}/settings`}>
                        <Button variant="ghost" leftIcon={<Settings size={18} />}>Settings</Button>
                    </Link>
                )}
                <InviteLink code={family.code} />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Members"
                    value={totalMembers}
                    subtitle={`${contributors.length} active contributors`}
                    icon={<Users className="w-5 h-5" />}
                    variant="gradient"
                />
                <StatsCard
                    title="Total Collected"
                    value={`KES ${totalCollected.toLocaleString()}`}
                    subtitle="This month"
                    icon={<Wallet className="w-5 h-5" />}
                    variant="success"
                    trend={{ value: 12, label: "vs last month" }}
                />
                <StatsCard
                    title="Target Amount"
                    value={`KES ${targetAmount.toLocaleString()}`}
                    subtitle="Monthly goal"
                    icon={<TrendingUp className="w-5 h-5" />}
                    variant="default"
                />
                <StatsCard
                    title="Progress"
                    value={`${Math.round(monthlyProgress)}%`}
                    subtitle={`KES ${(targetAmount - totalCollected).toLocaleString()} remaining`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    variant={monthlyProgress >= 100 ? 'success' : monthlyProgress >= 50 ? 'warning' : 'default'}
                />
            </div>

            {/* Admin Section */}
            {(currentUserRole === 'PRESIDENT' || currentUserRole === 'TREASURER') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <TreasurerVerificationSection familyId={family.id} />
                    </div>
                    {currentUserRole === 'PRESIDENT' && (
                        <>
                            <RoleManager
                                familyId={family.id}
                                members={allMembers}
                                currentUserId={userFamily.user.id}
                            />
                        </>
                    )}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TreasurerPayment
                            familyId={family.id}
                            members={allMembers}
                            campaigns={campaigns}
                        />
                        <CampaignManager
                            familyId={family.id}
                            members={allMembers}
                        />
                    </div>
                </div>
            )}

            {/* Active Campaigns */}
            <ActiveCampaignsList familyId={family.id} campaigns={campaigns} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Contributors */}
                <div className="lg:col-span-2 space-y-8">
                    <MemberList contributors={contributors} />
                </div>

                {/* Right Column: Ghost Town & Info */}
                <div className="space-y-8">
                    <GhostTown ghosts={ghosts} />

                    <Card>
                        <div className="p-6">
                            <h3 className="font-semibold leading-none tracking-tight mb-4 text-cousin-blue">My Role</h3>
                            <p className="text-sm text-gray-mid">
                                You are a <span className="font-bold text-gray-dark uppercase">{currentUserRole}</span> of this family.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
