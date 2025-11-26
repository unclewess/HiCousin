import { getFamilyMembers, getReportsData, getDashboardData, getUserFamily } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { FundSettingsDialog } from "@/components/Admin/FundSettingsDialog";
import { YearSelect } from "@/components/Dashboard/YearSelect";
import { ContributionForm } from "@/components/Dashboard/ContributionForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Trophy, Archive, ArrowLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ familyId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getGeneralFundData(familyId: string, year: number) {
    const members = await prisma.familyMember.findMany({
        where: { familyId, status: 'ACTIVE' },
        include: { user: true },
        orderBy: { joinedAt: 'asc' }
    });

    // Get all contributions to determine available years
    const allContributions = await prisma.contribution.findMany({
        where: { familyId, campaignId: null },
        select: { contributionMonth: true }
    });

    const years = Array.from(new Set(allContributions.map(c => c.contributionMonth.getFullYear())))
        .sort((a, b) => b - a);

    // Ensure current year is always available
    const currentYear = new Date().getFullYear();
    if (!years.includes(currentYear)) {
        years.unshift(currentYear);
        years.sort((a, b) => b - a);
    }

    // Get contributions for the selected year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const contributions = await prisma.contribution.findMany({
        where: {
            familyId,
            campaignId: null, // General fund only
            contributionMonth: {
                gte: startOfYear,
                lt: endOfYear
            }
        }
    });

    const family = await prisma.family.findUnique({ where: { id: familyId } });
    const target = await prisma.monthlyTarget.findUnique({
        where: {
            familyId_year_month: {
                familyId,
                year: year,
                month: new Date().getMonth() + 1 // Use current month for target display, or maybe average? 
                // For now, let's just show the target for the current month of the selected year if it's the current year, 
                // or the last month of that year? 
                // Actually, the UI shows a single "Monthly Target". 
                // Let's fetch the target for December of that year as a representative, or the current month if it's the current year.
            }
        }
    });

    // Better approach for target: Fetch the most recent target set for that year
    const latestTarget = await prisma.monthlyTarget.findFirst({
        where: { familyId, year },
        orderBy: { month: 'desc' }
    });

    // Calculate totals
    const memberTotals: Record<string, number> = {};
    let grandTotal = 0;

    contributions.forEach(c => {
        const amount = Number(c.amount);
        memberTotals[c.userId] = (memberTotals[c.userId] || 0) + amount;
        grandTotal += amount;
    });

    return {
        members,
        contributions,
        minContribution: family ? Number(family.baseShareValue) : 100,
        monthlyTarget: latestTarget ? Number(latestTarget.targetAmount) : 5000,
        years,
        memberTotals,
        grandTotal
    };
}

export default async function GeneralFundPage({ params, searchParams }: PageProps) {
    const { familyId } = await params;
    const resolvedSearchParams = await searchParams;

    const currentYear = new Date().getFullYear();
    const selectedYear = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year as string) : currentYear;

    // Check permissions
    const userFamily = await getUserFamily(familyId);
    const isPresident = userFamily?.role === 'PRESIDENT';
    const isTreasurer = userFamily?.role === 'TREASURER';
    const canManageFunds = isPresident || isTreasurer;

    const { members, contributions, minContribution, monthlyTarget, years, memberTotals, grandTotal } = await getGeneralFundData(familyId, selectedYear);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Helper to check status for a member/month
    const getStatus = (userId: string, monthIndex: number) => {
        const targetMonth = new Date(selectedYear, monthIndex, 1);
        const contrib = contributions.find(c =>
            c.userId === userId &&
            c.contributionMonth.getTime() === targetMonth.getTime()
        );

        if (!contrib) return "UNPAID";
        return contrib.status; // PAID or PARTIAL
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/${familyId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={24} />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-dark font-fun">General Fund / Monthly Dues</h2>
                        <p className="text-gray-mid">Tracking monthly contributions for {selectedYear}.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <YearSelect years={years} currentYear={selectedYear} />
                    <Link href={`/dashboard/${familyId}/leaderboard`}>
                        <Button variant="secondary" leftIcon={<Trophy size={16} />}>
                            Leaderboard
                        </Button>
                    </Link>
                    <Link href={`/dashboard/${familyId}/history`}>
                        <Button variant="outline" leftIcon={<Archive size={16} />}>
                            Past Campaigns
                        </Button>
                    </Link>
                    {canManageFunds && <ContributionForm familyId={familyId} />}
                    {isPresident && (
                        <FundSettingsDialog
                            familyId={familyId}
                            currentTarget={monthlyTarget}
                            currentMin={minContribution}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white shadow-soft-drop border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-mid uppercase tracking-wide">Monthly Target ({selectedYear})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-cousin-purple font-fun">${monthlyTarget.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-soft-drop border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-mid uppercase tracking-wide">Min. Contribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-dark font-fun">${minContribution.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-soft-drop border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-mid uppercase tracking-wide">Total Collected ({selectedYear})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-cousin-green font-fun">${grandTotal.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden border-none shadow-medium">
                <CardHeader className="bg-gray-50/50">
                    <CardTitle className="text-xl font-bold text-gray-dark font-fun">Contribution Matrix</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-mid uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">Member</th>
                                {months.map(m => (
                                    <th key={m} className="px-4 py-4 text-center font-bold">{m}</th>
                                ))}
                                <th className="px-6 py-4 text-center font-bold text-gray-dark">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {members.map(member => (
                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                            <AvatarImage src={member.user.avatarUrl || ""} />
                                            <AvatarFallback className="bg-cousin-blue/10 text-cousin-blue font-bold">
                                                {member.user.fullName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate max-w-[150px] text-gray-dark font-semibold">{member.user.fullName}</span>
                                    </td>
                                    {months.map((_, index) => {
                                        const status = getStatus(member.user.id, index);
                                        let colorClass = "bg-gray-100 text-gray-400"; // Unpaid
                                        let icon = "•";

                                        if (status === "PAID") {
                                            colorClass = "bg-cousin-green/10 text-cousin-green";
                                            icon = "✓";
                                        }
                                        if (status === "PARTIAL") {
                                            colorClass = "bg-cousin-yellow/20 text-cousin-yellow-dark";
                                            icon = "≈";
                                        }

                                        return (
                                            <td key={index} className="px-2 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${colorClass}`}>
                                                    {status === "UNPAID" ? "•" : icon}
                                                </span>
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-4 text-center font-bold text-gray-dark">
                                        ${(memberTotals[member.user.id] || 0).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
