'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trophy, Medal, Award, ArrowLeft, Calendar, Flame, Clock, Sunrise, CheckCircle, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { LeaderboardPodium, LeaderboardRow } from "./LeaderboardComponents";

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
            <LeaderboardPodium
                topThree={topThree.map(member => ({
                    id: member.userId,
                    fullName: member.fullName,
                    avatarUrl: member.avatarUrl,
                    totalContributed: member.totalAmount,
                    rank: member.rank
                }))}
            />

            {/* The Rest */}
            {others.length > 0 && (
                <div className="max-w-3xl mx-auto space-y-3">
                    <h3 className="text-xl font-bold text-gray-600 font-outfit mb-4">Honorable Mentions</h3>
                    {others.map((member) => (
                        <LeaderboardRow
                            key={member.userId}
                            member={{
                                id: member.userId,
                                fullName: member.fullName,
                                avatarUrl: member.avatarUrl,
                                totalContributed: member.totalAmount,
                                rank: member.rank
                            }}
                        />
                    ))}
                </div>
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
