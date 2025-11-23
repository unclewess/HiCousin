import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
            <h3 className="text-xl font-semibold tracking-tight">Active Campaigns & Funds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* General Fund Card */}
                <Link href={`/dashboard/${familyId}/general-fund`}>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex justify-between items-start">
                                <span className="truncate pr-2">General Fund</span>
                                <Badge variant="default" className="shrink-0">Monthly</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                Monthly dues and general contributions.
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                View Spreadsheet &rarr;
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {campaigns.map(campaign => (
                    <Link key={campaign.id} href={`/dashboard/${familyId}/campaigns/${campaign.id}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex justify-between items-start">
                                    <span className="truncate pr-2">{campaign.name}</span>
                                    <Badge variant="outline" className="shrink-0">Active</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {campaign.targetAmount ? (
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            Target: ${campaign.targetAmount.toFixed(2)}
                                        </div>
                                        {/* Note: We'd need current progress here to show a bar, 
                                            but the basic campaign list might not have it. 
                                            Let's keep it simple for now or fetch it if needed. 
                                            For now, just showing target is fine. */}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">No target set</div>
                                )}
                                {campaign.deadline && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Due: {new Date(campaign.deadline).toLocaleDateString()}
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
