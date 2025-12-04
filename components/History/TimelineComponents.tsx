'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Calendar, TrendingUp, Users, DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface TimelineItemProps {
    campaign: {
        id: string;
        name: string;
        description?: string | null;
        targetAmount?: number | null;
        deadline?: Date | null;
        status: string;
        createdAt: Date;
    };
    canManage: boolean;
    familyId: string;
}

export function TimelineItem({ campaign, canManage, familyId }: TimelineItemProps) {
    const isCompleted = campaign.status === 'COMPLETED';
    const isExpired = campaign.status === 'EXPIRED';

    return (
        <div className="relative pl-8 pb-8 group">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cousin-purple/50 to-cousin-pink/50 group-last:hidden" />

            {/* Timeline dot */}
            <div className={cn(
                "absolute left-0 top-2 w-6 h-6 rounded-full border-4 border-white shadow-md transition-all duration-200",
                isCompleted ? "bg-gradient-to-br from-cousin-green to-emerald-500" :
                    isExpired ? "bg-gradient-to-br from-gray-400 to-gray-500" :
                        "bg-gradient-to-br from-cousin-purple to-cousin-pink"
            )}>
                {isCompleted && (
                    <CheckCircle className="w-4 h-4 text-white absolute -top-1 -left-1" />
                )}
            </div>

            {/* Content Card */}
            <Card variant="interactive" className="ml-4">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="text-lg font-outfit">{campaign.name}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                {campaign.description || 'No description'}
                            </p>
                        </div>
                        <Badge
                            variant={isCompleted ? 'success' : isExpired ? 'secondary' : 'gradient'}
                            className="shrink-0"
                        >
                            {isCompleted ? '✓ Completed' : isExpired ? 'Expired' : 'Active'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-cousin-green" />
                            <span className="text-gray-600">Target:</span>
                            <span className="font-semibold">
                                {campaign.targetAmount ? `KES ${campaign.targetAmount.toLocaleString()}` : 'No Limit'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-cousin-blue" />
                            <span className="text-gray-600">Deadline:</span>
                            <span className="font-semibold">
                                {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'None'}
                            </span>
                        </div>
                    </div>

                    {canManage && (
                        <div className="flex gap-2 pt-2 border-t">
                            <Button variant="outline" size="sm">
                                View Details
                            </Button>
                            {isExpired && (
                                <Button variant="primary" size="sm">
                                    Reactivate
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

interface TimelineYearProps {
    year: number;
    months: Record<string, any[]>;
    canManage: boolean;
    familyId: string;
}

export function TimelineYear({ year, months, canManage, familyId }: TimelineYearProps) {
    return (
        <div className="space-y-6">
            {/* Year Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-cousin-purple to-cousin-pink p-4 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-white font-outfit flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    {year}
                </h3>
            </div>

            {/* Months */}
            {Object.entries(months).map(([month, campaigns]) => (
                <div key={month} className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-700 font-outfit pl-8 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cousin-blue" />
                        {month}
                    </h4>
                    {campaigns.map((campaign: any) => (
                        <TimelineItem
                            key={campaign.id}
                            campaign={campaign}
                            canManage={canManage}
                            familyId={familyId}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
