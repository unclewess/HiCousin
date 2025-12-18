'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Users, Wallet, TrendingUp, Award } from 'lucide-react';

interface DashboardHeroProps {
    familyName: string;
    userName?: string;
    role: 'PRESIDENT' | 'TREASURER' | 'MEMBER';
    stats: {
        totalMembers: number;
        totalCollected: number;
        targetAmount: number;
        monthlyProgress: number;
    };
}

const roleGreetings = {
    PRESIDENT: {
        emoji: '👑',
        greeting: 'Welcome back, President',
        subtitle: 'Your family is counting on your leadership',
    },
    TREASURER: {
        emoji: '💰',
        greeting: 'Welcome back, Treasurer',
        subtitle: 'Keep those finances in check!',
    },
    MEMBER: {
        emoji: '👋',
        greeting: 'Welcome back',
        subtitle: 'Great to see you contributing!',
    },
};

export function DashboardHero({ familyName, userName, role, stats }: DashboardHeroProps) {
    const roleInfo = roleGreetings[role];
    const progressPercentage = (stats.totalCollected / stats.targetAmount) * 100;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cousin-purple via-cousin-blue to-cousin-pink p-8 md:p-12 text-white shadow-xl">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 space-y-6">
                {/* Greeting */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-5xl animate-wave">{roleInfo.emoji}</span>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold font-outfit">
                                {roleInfo.greeting}
                                {userName && `, ${userName.split(' ')[0]}`}!
                            </h1>
                            <p className="text-white/80 text-lg">{roleInfo.subtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Family Name */}
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                    <p className="text-sm text-white/80">Family Group</p>
                    <h2 className="text-2xl font-bold font-outfit">{familyName}</h2>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        label="Members"
                        value={stats.totalMembers}
                    />
                    <StatCard
                        icon={<Wallet className="w-6 h-6" />}
                        label="Collected"
                        value={`KES ${stats.totalCollected.toLocaleString()}`}
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Target"
                        value={`KES ${stats.targetAmount.toLocaleString()}`}
                    />
                    <StatCard
                        icon={<Award className="w-6 h-6" />}
                        label="Progress"
                        value={`${Math.round(progressPercentage)}%`}
                    />
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-white/80">Monthly Goal Progress</span>
                        <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className={cn(
                                "h-full bg-gradient-to-r from-white to-white/90 rounded-full transition-all duration-1000 ease-out",
                                progressPercentage >= 100 && "animate-pulse"
                            )}
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
                <div className="text-white/80">{icon}</div>
                <p className="text-xs text-white/60 uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-xl md:text-2xl font-bold font-outfit">{value}</p>
        </div>
    );
}
