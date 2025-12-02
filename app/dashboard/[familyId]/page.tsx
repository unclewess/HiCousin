import InviteLink from "../InviteLink";
import { getUserFamily, getDashboardData, getFamilyCampaigns } from "../../actions";
import { redirect } from "next/navigation";
import { ProgressSection } from "@/components/Dashboard/ProgressSection";
import { MemberList } from "@/components/Dashboard/MemberList";
import { GhostTown } from "@/components/Dashboard/GhostTown";
import { RoleManager } from "@/components/Admin/RoleManager";
import { TreasurerPayment } from "@/components/Admin/TreasurerPayment";
import { TargetManager } from "@/components/Admin/TargetManager";
import { CampaignManager } from "@/components/Admin/CampaignManager";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Archive } from "lucide-react";

import { ActiveCampaignsList } from "@/components/Dashboard/ActiveCampaignsList";

interface PageProps {
    params: Promise<{ familyId: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
    const { familyId } = await params;

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

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-rounded shadow-soft-drop">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-cousin-purple font-fun">{family.name}</h2>
                    <p className="text-gray-mid font-medium">Monthly Contribution Dashboard</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/dashboard/${family.id}/general-fund`}>
                        <Button variant="primary">General Fund</Button>
                    </Link>
                    <Link href={`/dashboard/${family.id}/history`}>
                        <Button variant="outline" leftIcon={<Archive size={16} />}>Past Campaigns</Button>
                    </Link>
                    <Link href={`/dashboard/${family.id}/reports`}>
                        <Button variant="secondary">View Reports</Button>
                    </Link>
                    {currentUserRole === 'PRESIDENT' && (
                        <Link href={`/dashboard/${family.id}/settings`}>
                            <Button variant="secondary">Settings</Button>
                        </Link>
                    )}
                    <InviteLink code={family.code} />
                </div>
            </div>

            {/* Progress Section */}
            <ProgressSection
                totalCollected={totalCollected}
                targetAmount={targetAmount}
            />

            {/* Admin Section */}
            {(currentUserRole === 'PRESIDENT' || currentUserRole === 'TREASURER') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
