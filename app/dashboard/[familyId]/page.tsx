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
import { Button } from "@/components/ui/button";

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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{family.name}</h2>
                    <p className="text-muted-foreground">Monthly Contribution Dashboard</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/${family.id}/reports`}>
                        <Button variant="outline">View Reports</Button>
                    </Link>
                    {currentUserRole === 'PRESIDENT' && (
                        <Link href={`/dashboard/${family.id}/settings`}>
                            <Button variant="outline">Settings</Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentUserRole === 'PRESIDENT' && (
                        <>
                            <RoleManager
                                familyId={family.id}
                                members={allMembers}
                                currentUserId={userFamily.user.id}
                            />
                        </>
                    )}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">My Role</h3>
                        <p className="text-sm text-muted-foreground">
                            You are a <span className="font-medium text-foreground">{currentUserRole}</span> of this family.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
