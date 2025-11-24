import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";

interface Campaign {
    id: string;
    name: string;
    targetAmount: number | null;
    deadline: Date | null;
}

interface ActiveCampaignsListProps {
    familyId: string;
    campaigns: Campaign[];
}

export function ActiveCampaignsList({ familyId, campaigns }: ActiveCampaignsListProps) {
    if (campaigns.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-gray-dark font-fun">Active Campaigns & Funds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* General Fund Card */}
                <Link href={`/dashboard/${familyId}/general-fund`}>
                    <Card variant="hoverable" className="h-full border-cousin-green/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex justify-between items-start text-cousin-green">
                                <span className="truncate pr-2">General Fund</span>
                                <Badge variant="default" className="shrink-0 bg-cousin-green hover:bg-cousin-green/90">Monthly</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-mid">
                                Monthly dues and general contributions.
                            </div>
                            <div className="mt-4 text-xs font-semibold text-cousin-blue flex items-center">
                                View Spreadsheet <span className="ml-1 text-lg">&rarr;</span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {campaigns.map(campaign => (
                    <Link key={campaign.id} href={`/dashboard/${familyId}/campaigns/${campaign.id}`}>
                        <Card variant="hoverable" className="h-full border-cousin-purple/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold flex justify-between items-start text-cousin-purple">
                                    <span className="truncate pr-2">{campaign.name}</span>
                                    <Badge variant="outline" className="shrink-0 border-cousin-purple text-cousin-purple">Active</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {campaign.targetAmount ? (
                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-mid">
                                            Target: <span className="font-semibold text-gray-dark">${campaign.targetAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-mid italic">No target set</div>
                                )}
                                {campaign.deadline && (
                                    <div className="mt-4 text-xs text-gray-mid flex items-center">
                                        <span className="mr-1">Due:</span>
                                        <span className="font-medium text-gray-dark">{new Date(campaign.deadline).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
