import { getCampaignDetails } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ familyId: string; campaignId: string }>;
}

export default async function CampaignDetailsPage({ params }: PageProps) {
    const { familyId, campaignId } = await params;
    const campaign = await getCampaignDetails(familyId, campaignId);

    if (!campaign) {
        redirect(`/dashboard/${familyId}`);
    }

    const totalCollected = campaign.contributions.reduce((sum, c) => sum + c.amount, 0);
    const progress = campaign.targetAmount ? Math.min((totalCollected / campaign.targetAmount) * 100, 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">{campaign.name}</h2>
                    <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {campaign.status}
                    </Badge>
                </div>
                {campaign.description && (
                    <p className="text-muted-foreground mt-2">{campaign.description}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Collected: ${totalCollected.toFixed(2)}</span>
                            {campaign.targetAmount && (
                                <span>Target: ${campaign.targetAmount.toFixed(2)}</span>
                            )}
                        </div>
                        {campaign.targetAmount && (
                            <Progress value={progress} className="h-2" />
                        )}
                        {!campaign.targetAmount && (
                            <div className="text-sm text-muted-foreground">No target set for this campaign.</div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground">Participants</div>
                                <div className="text-2xl font-bold">{campaign.participants.length}</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground">Contributions</div>
                                <div className="text-2xl font-bold">{campaign.contributions.length}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <span className="font-medium">Deadline:</span>
                            <div className="text-muted-foreground">
                                {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : "No deadline"}
                            </div>
                        </div>
                        <div>
                            <span className="font-medium">Min. Contribution:</span>
                            <div className="text-muted-foreground">
                                {campaign.minContribution ? `$${campaign.minContribution.toFixed(2)}` : "None"}
                            </div>
                        </div>
                        <div>
                            <span className="font-medium">Type:</span>
                            <div className="text-muted-foreground">{campaign.type}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contributions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Contribution History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {campaign.contributions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No contributions yet.</p>
                        ) : (
                            campaign.contributions.map(c => (
                                <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={c.user.avatarUrl || ""} />
                                            <AvatarFallback>{c.user.fullName?.[0] || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{c.user.fullName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {c.paidAt ? new Date(c.paidAt).toLocaleDateString() : "Pending"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="font-medium text-green-600">
                                        +${c.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
