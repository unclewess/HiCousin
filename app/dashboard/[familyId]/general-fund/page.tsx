import { getFamilyMembers, getReportsData, getDashboardData, getUserFamily } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { FundSettingsDialog } from "@/components/Admin/FundSettingsDialog";
import { YearSelect } from "@/components/Dashboard/YearSelect";

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

    // Check permissions for settings button
    const userFamily = await getUserFamily(familyId);
    const isPresident = userFamily?.role === 'PRESIDENT';

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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">General Fund / Monthly Dues</h2>
                    <p className="text-muted-foreground">Tracking monthly contributions for {selectedYear}.</p>
                </div>
                <div className="flex items-center gap-4">
                    <YearSelect years={years} currentYear={selectedYear} />
                    {isPresident && (
                        <FundSettingsDialog
                            familyId={familyId}
                            currentTarget={monthlyTarget}
                            currentMin={minContribution}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Target ({selectedYear})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${monthlyTarget.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Min. Contribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${minContribution.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected ({selectedYear})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${grandTotal.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contribution Matrix</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Member</th>
                                {months.map(m => (
                                    <th key={m} className="px-4 py-3 text-center">{m}</th>
                                ))}
                                <th className="px-4 py-3 text-center font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(member => (
                                <tr key={member.id} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={member.user.avatarUrl || ""} />
                                            <AvatarFallback>{member.user.fullName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="truncate max-w-[150px]">{member.user.fullName}</span>
                                    </td>
                                    {months.map((_, index) => {
                                        const status = getStatus(member.user.id, index);
                                        let colorClass = "bg-gray-100 text-gray-800"; // Unpaid
                                        if (status === "PAID") colorClass = "bg-green-100 text-green-800";
                                        if (status === "PARTIAL") colorClass = "bg-yellow-100 text-yellow-800";

                                        return (
                                            <td key={index} className="px-2 py-3 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
                                                    {status === "UNPAID" ? "-" : status}
                                                </span>
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-3 text-center font-bold">
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
