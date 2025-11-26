import { getUserFamily } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import prisma from "@/lib/db";
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PageProps {
    params: Promise<{ familyId: string }>;
}

async function getLeaderboardData(familyId: string) {
    // Fetch all members
    const members = await prisma.familyMember.findMany({
        where: { familyId, status: 'ACTIVE' },
        include: { user: true }
    });

    // Fetch all contributions
    const contributions = await prisma.contribution.findMany({
        where: { familyId, status: 'PAID' }, // Only count paid contributions
    });

    // Calculate totals
    const memberTotals: Record<string, number> = {};
    contributions.forEach(c => {
        const amount = Number(c.amount);
        memberTotals[c.userId] = (memberTotals[c.userId] || 0) + amount;
    });

    // Create ranked list
    const rankedMembers = members.map(m => ({
        ...m,
        totalContribution: memberTotals[m.userId] || 0
    })).sort((a, b) => b.totalContribution - a.totalContribution);

    return rankedMembers;
}

export default async function LeaderboardPage({ params }: PageProps) {
    const { familyId } = await params;
    const rankedMembers = await getLeaderboardData(familyId);

    const topThree = rankedMembers.slice(0, 3);
    const others = rankedMembers.slice(3);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/${familyId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-dark font-fun flex items-center gap-2">
                        <Trophy className="text-cousin-yellow" /> Leaderboard
                    </h2>
                    <p className="text-gray-mid">Top contributors this month.</p>
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
                {/* 2nd Place */}
                {topThree[1] && (
                    <Card className="order-2 md:order-1 bg-gradient-to-b from-gray-100 to-gray-200 border-none shadow-medium transform hover:-translate-y-2 transition-transform">
                        <CardHeader className="text-center pb-2">
                            <Medal className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <CardTitle className="text-gray-600 font-fun text-xl">Silver Cousin</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Avatar className="w-20 h-20 mx-auto border-4 border-gray-300 mb-4">
                                <AvatarImage src={topThree[1].user.avatarUrl || ""} />
                                <AvatarFallback>{topThree[1].user.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="font-bold text-lg text-gray-dark">{topThree[1].user.fullName}</div>
                            <div className="text-gray-500 font-mono font-bold">${topThree[1].totalContribution.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                    <Card className="order-1 md:order-2 bg-gradient-to-b from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-soft-drop transform scale-110 z-10">
                        <CardHeader className="text-center pb-2">
                            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-2 animate-bounce" />
                            <CardTitle className="text-yellow-700 font-fun text-2xl">Golden Cousin</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Avatar className="w-24 h-24 mx-auto border-4 border-yellow-400 mb-4 shadow-lg">
                                <AvatarImage src={topThree[0].user.avatarUrl || ""} />
                                <AvatarFallback>{topThree[0].user.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="font-bold text-xl text-gray-dark">{topThree[0].user.fullName}</div>
                            <div className="text-yellow-600 font-mono font-bold text-lg">${topThree[0].totalContribution.toLocaleString()}</div>
                            <div className="mt-4 text-sm font-medium text-yellow-800 bg-yellow-200/50 py-1 px-3 rounded-full inline-block">
                                "Legendary Status! 👑"
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                    <Card className="order-3 bg-gradient-to-b from-orange-50 to-orange-100 border-none shadow-medium transform hover:-translate-y-2 transition-transform">
                        <CardHeader className="text-center pb-2">
                            <Award className="w-12 h-12 mx-auto text-orange-400 mb-2" />
                            <CardTitle className="text-orange-700 font-fun text-xl">Bronze Cousin</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Avatar className="w-20 h-20 mx-auto border-4 border-orange-300 mb-4">
                                <AvatarImage src={topThree[2].user.avatarUrl || ""} />
                                <AvatarFallback>{topThree[2].user.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="font-bold text-lg text-gray-dark">{topThree[2].user.fullName}</div>
                            <div className="text-orange-600 font-mono font-bold">${topThree[2].totalContribution.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* The Rest */}
            {others.length > 0 && (
                <Card className="max-w-3xl mx-auto border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-fun text-gray-mid">Honorable Mentions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {others.map((member, index) => (
                                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-gray-400 w-6 text-center">#{index + 4}</span>
                                        <Avatar>
                                            <AvatarImage src={member.user.avatarUrl || ""} />
                                            <AvatarFallback>{member.user.fullName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-gray-dark">{member.user.fullName}</span>
                                    </div>
                                    <div className="font-mono font-bold text-gray-mid">
                                        ${member.totalContribution.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
