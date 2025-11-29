'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trophy, Medal, Award, ArrowLeft, Calendar, Flame, Clock, Sunrise, CheckCircle, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    totalShares: number;
    totalAmount: number;
    currentStreak: number;
    rank: number;
    lastContributionStatus: 'early' | 'on-time' | 'late' | 'none';
    joinedAt: Date;
}

interface LeaderboardClientProps {
    familyId: string;
    activeMembers: LeaderboardEntry[];
    inactiveMembers: LeaderboardEntry[];
    metrics: {
        totalShares: number;
        totalAmount: number;
        averageStreak: number;
    };
}

export function LeaderboardClient({ familyId, activeMembers, inactiveMembers, metrics }: LeaderboardClientProps) {
    const [showInactive, setShowInactive] = useState(false);

    const getBadge = (status: string) => {
        switch (status) {
            case 'early':
                return { icon: <Sunrise size={14} />, label: "Early Bird", color: "bg-blue-100 text-blue-700 border-blue-200" };
            case 'on-time':
                return { icon: <CheckCircle size={14} />, label: "On-Time", color: "bg-green-100 text-green-700 border-green-200" };
            case 'late':
                return { icon: <Clock size={14} />, label: "Late Save", color: "bg-orange-100 text-orange-700 border-orange-200" };
            default:
                return null;
        }
    };

    const topThree = activeMembers.slice(0, 3);
    const others = activeMembers.slice(3);

    return (
        <div className="space-y-8">
            {/* Header with Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-dark font-fun flex items-center gap-2">
                        <Trophy className="text-cousin-yellow" /> Leaderboard
                    </h2>
                    <p className="text-gray-mid">Top contributors based on shares earned.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Button
                        variant={showInactive ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowInactive(!showInactive)}
                    >
                        {showInactive ? "Hide" : "Show"} Inactive ({inactiveMembers.length})
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white shadow-soft-drop border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-mid uppercase tracking-wide">Total Shares</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-cousin-purple font-fun">{metrics.totalShares.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-soft-drop border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-mid uppercase tracking-wide">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-cousin-green font-fun">${metrics.totalAmount.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-soft-drop border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-mid uppercase tracking-wide">Avg Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-500 font-fun flex items-center gap-2">
                            <Flame size={32} className="text-orange-500" />
                            {metrics.averageStreak.toFixed(1)} mo
                        </div>
                    </CardContent>
                </Card>
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
                                <AvatarImage src={topThree[1].avatarUrl || ""} />
                                <AvatarFallback>{topThree[1].fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="font-bold text-lg text-gray-dark">{topThree[1].fullName}</div>
                            <div className="text-gray-500 font-mono font-bold text-sm">{topThree[1].totalShares.toFixed(2)} shares</div>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                {topThree[1].currentStreak > 0 && (
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                        <Flame size={12} className="mr-1" />{topThree[1].currentStreak}mo
                                    </Badge>
                                )}
                                {(() => {
                                    const badge = getBadge(topThree[1].lastContributionStatus);
                                    return badge && (
                                        <Badge className={badge.color + " border"}>
                                            {badge.icon} <span className="ml-1">{badge.label}</span>
                                        </Badge>
                                    );
                                })()}
                            </div>
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
                                <AvatarImage src={topThree[0].avatarUrl || ""} />
                                <AvatarFallback>{topThree[0].fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="font-bold text-xl text-gray-dark">{topThree[0].fullName}</div>
                            <div className="text-yellow-600 font-mono font-bold text-lg">{topThree[0].totalShares.toFixed(2)} shares</div>
                            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                                {topThree[0].currentStreak > 0 && (
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                        <Flame size={12} className="mr-1" />{topThree[0].currentStreak}mo
                                    </Badge>
                                )}
                                {(() => {
                                    const badge = getBadge(topThree[0].lastContributionStatus);
                                    return badge && (
                                        <Badge className={badge.color + " border"}>
                                            {badge.icon} <span className="ml-1">{badge.label}</span>
                                        </Badge>
                                    );
                                })()}
                            </div>
                            <div className="mt-4 text-sm font-medium text-yellow-800 bg-yellow-200/50 py-1 px-3 rounded-full inline-block">
                                👑 Legendary Status!
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
                                <AvatarImage src={topThree[2].avatarUrl || ""} />
                                <AvatarFallback>{topThree[2].fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="font-bold text-lg text-gray-dark">{topThree[2].fullName}</div>
                            <div className="text-orange-600 font-mono font-bold text-sm">{topThree[2].totalShares.toFixed(2)} shares</div>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                {topThree[2].currentStreak > 0 && (
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                        <Flame size={12} className="mr-1" />{topThree[2].currentStreak}mo
                                    </Badge>
                                )}
                                {(() => {
                                    const badge = getBadge(topThree[2].lastContributionStatus);
                                    return badge && (
                                        <Badge className={badge.color + " border"}>
                                            {badge.icon} <span className="ml-1">{badge.label}</span>
                                        </Badge>
                                    );
                                })()}
                            </div>
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
                        <div className="space-y-3">
                            {others.map((member) => (
                                <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-gray-400 w-8 text-center">#{member.rank}</span>
                                        <Avatar>
                                            <AvatarImage src={member.avatarUrl || ""} />
                                            <AvatarFallback>{member.fullName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-gray-dark">{member.fullName}</div>
                                            <div className="text-xs text-gray-500 font-mono">{member.totalShares.toFixed(2)} shares</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {member.currentStreak > 0 && (
                                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                                <Flame size={10} className="mr-1" />{member.currentStreak}
                                            </Badge>
                                        )}
                                        {(() => {
                                            const badge = getBadge(member.lastContributionStatus);
                                            return badge && (
                                                <Badge className={badge.color + " border text-xs"}>
                                                    {badge.icon}
                                                </Badge>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Ghost Town Section */}
            {showInactive && inactiveMembers.length > 0 && (
                <Card className="max-w-3xl mx-auto border-2 border-dashed border-gray-300 bg-gray-50">
                    <CardHeader>
                        <CardTitle className="font-fun text-gray-500 flex items-center gap-2">
                            <AlertCircle size={20} />
                            Ghost Town - Inactive This Month ({inactiveMembers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {inactiveMembers.map((member) => (
                                <div key={member.userId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="opacity-50">
                                            <AvatarImage src={member.avatarUrl || ""} />
                                            <AvatarFallback>{member.fullName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-gray-500">{member.fullName}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">{member.totalShares.toFixed(2)} shares (previous)</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
