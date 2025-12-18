'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown, Award, Users } from 'lucide-react';

// Constants moved outside components to prevent recreation on each render
const PODIUM_HEIGHTS = ['h-32', 'h-40', 'h-24'] as const; // 2nd, 1st, 3rd
const PODIUM_COLORS = [
    'from-gray-300 to-gray-400', // Silver
    'from-yellow-400 to-yellow-600', // Gold
    'from-orange-400 to-orange-600', // Bronze
] as const;
const TROPHY_EMOJIS = ['🥈', '🥇', '🥉'] as const;

interface LeaderboardPodiumProps {
    topThree: Array<{
        id: string;
        fullName: string;
        avatarUrl?: string | null;
        totalContributed: number;
        rank: number;
    }>;
}

export const LeaderboardPodium = React.memo(function LeaderboardPodium({ topThree }: LeaderboardPodiumProps) {
    if (topThree.length === 0) return null;

    // Reorder for podium display: 2nd, 1st, 3rd
    const podiumOrder = useMemo(() => [
        topThree[1], // 2nd place (left)
        topThree[0], // 1st place (center, tallest)
        topThree[2], // 3rd place (right)
    ].filter(Boolean), [topThree]);

    return (
        <div className="relative">
            {/* Confetti for #1 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
                    🎉
                </div>
            </div>

            <div className="flex items-end justify-center gap-4 mb-8">
                {podiumOrder.map((member, index) => {
                    if (!member) return null;
                    const actualRank = member.rank;

                    return (
                        <div
                            key={member.id}
                            className={cn(
                                "flex flex-col items-center gap-3 transition-all duration-500 hover:scale-105",
                                index === 1 && "z-10" // 1st place on top
                            )}
                        >
                            {/* Avatar */}
                            <div className="relative">
                                <div
                                    className={cn(
                                        "w-20 h-20 rounded-full border-4 overflow-hidden",
                                        index === 1 ? "border-yellow-400 shadow-glow" : "border-white shadow-lg"
                                    )}
                                >
                                    {member.avatarUrl ? (
                                        <img
                                            src={member.avatarUrl}
                                            alt={member.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-cousin-purple to-cousin-pink flex items-center justify-center text-white text-2xl font-bold">
                                            {member.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                {/* Trophy Badge */}
                                <div className="absolute -top-2 -right-2 text-3xl animate-pulse">
                                    {TROPHY_EMOJIS[index]}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="text-center">
                                <p className="font-bold text-gray-900 font-outfit">{member.fullName}</p>
                                <p className="text-sm text-gray-500">
                                    KES {member.totalContributed.toLocaleString()}
                                </p>
                            </div>

                            {/* Podium */}
                            <div
                                className={cn(
                                    "w-24 rounded-t-xl bg-gradient-to-b shadow-lg flex items-center justify-center",
                                    PODIUM_HEIGHTS[index],
                                    PODIUM_COLORS[index]
                                )}
                            >
                                <span className="text-white text-4xl font-bold font-outfit">
                                    {actualRank}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});


interface LeaderboardRowProps {
    member: {
        id: string;
        fullName: string;
        avatarUrl?: string | null;
        totalContributed: number;
        rank: number;
    };
    previousRank?: number;
}

export const LeaderboardRow = React.memo(function LeaderboardRow({ member, previousRank }: LeaderboardRowProps) {
    const rankChange = previousRank ? previousRank - member.rank : 0;
    const isTop3 = member.rank <= 3;

    return (
        <Card
            variant={isTop3 ? "gradient" : "default"}
            className={cn(
                "p-4 transition-all duration-200",
                isTop3 && "border-2 border-cousin-purple/20"
            )}
        >
            <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div
                    className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg font-outfit",
                        isTop3
                            ? "bg-gradient-to-br from-cousin-purple to-cousin-pink text-white shadow-md"
                            : "bg-gray-100 text-gray-600"
                    )}
                >
                    {member.rank}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                    {member.avatarUrl ? (
                        <img
                            src={member.avatarUrl}
                            alt={member.fullName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cousin-blue to-cousin-green flex items-center justify-center text-white font-bold">
                            {member.fullName.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Name & Progress */}
                <div className="flex-1">
                    <p className="font-bold text-gray-900 font-outfit">{member.fullName}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cousin-green to-cousin-blue rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((member.totalContributed / 10000) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                    <p className="font-bold text-lg text-gray-900 font-outfit">
                        KES {member.totalContributed.toLocaleString()}
                    </p>
                    {rankChange !== 0 && (
                        <div
                            className={cn(
                                "flex items-center gap-1 text-sm font-medium",
                                rankChange > 0 ? "text-cousin-green" : "text-red-500"
                            )}
                        >
                            {rankChange > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <span>{Math.abs(rankChange)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
});
