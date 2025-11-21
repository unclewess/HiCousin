import InviteLink from "./InviteLink";
import { getUserFamily, getDashboardData } from "../actions";
import { redirect } from "next/navigation";
import { ProgressSection } from "@/components/Dashboard/ProgressSection";
import { MemberList } from "@/components/Dashboard/MemberList";
import { GhostTown } from "@/components/Dashboard/GhostTown";
import { ContributionForm } from "@/components/Dashboard/ContributionForm";

export default async function DashboardPage() {
    const userFamily = await getUserFamily();

    if (!userFamily) {
        redirect("/onboarding");
    }

    const { family } = userFamily;
    const dashboardData = await getDashboardData(family.id);

    if (!dashboardData) {
        // Handle edge case where data fetch fails
        return <div>Failed to load dashboard data.</div>;
    }

    const { targetAmount, totalCollected, contributors, ghosts, currentUserRole } = dashboardData;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{family.name}</h2>
                    <p className="text-muted-foreground">Monthly Contribution Dashboard</p>
                </div>
                <div className="flex items-center gap-4">
                    <InviteLink code={family.code} />
                    <ContributionForm familyId={family.id} />
                </div>
            </div>

            {/* Progress Section */}
            <ProgressSection
                totalCollected={totalCollected}
                targetAmount={targetAmount}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Contributors */}
                <div className="lg:col-span-2 space-y-8">
                    <MemberList contributors={contributors} />
                </div>

                {/* Right Column: Ghost Town & Info */}
                <div className="space-y-8">
                    <GhostTown ghosts={ghosts} />

                    {/* Additional Info Card could go here */}
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
