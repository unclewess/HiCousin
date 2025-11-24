import { getReportsData } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { DownloadReportButton } from "@/components/Dashboard/DownloadReportButton";

interface PageProps {
    params: Promise<{ familyId: string }>;
}

export default async function ReportsPage({ params }: PageProps) {
    const { familyId } = await params;
    const data = await getReportsData(familyId);

    if (!data) {
        redirect("/families");
    }

    const { contributions, memberSummaries, campaignSummaries } = data;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                    <p className="text-muted-foreground">Overview of family contributions and campaigns.</p>
                </div>
                <DownloadReportButton contributions={contributions} />
            </div>

            {/* Campaign Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaignSummaries.map(campaign => (
                    <Card key={campaign.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex justify-between items-center">
                                {campaign.name}
                                <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {campaign.status}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${campaign.collectedAmount.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                of ${campaign.targetAmount.toFixed(2)} goal
                            </p>
                            <div className="mt-4 flex justify-between text-sm">
                                <span>Participants: {campaign.participantCount}</span>
                                {campaign.deadline && (
                                    <span>Due: {new Date(campaign.deadline).toLocaleDateString()}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Member Summaries */}
                <Card>
                    <CardHeader>
                        <CardTitle>Member Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {memberSummaries.map(member => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage src={member.avatarUrl || ""} />
                                            <AvatarFallback>{member.fullName?.[0] || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{member.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="font-medium">
                                        ${member.totalContributed.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Contributions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {contributions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No contributions recorded yet.</p>
                            ) : (
                                contributions.map(contribution => (
                                    <div key={contribution.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={contribution.memberAvatar || ""} />
                                                <AvatarFallback>{contribution.memberName?.[0] || "?"}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{contribution.memberName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {contribution.campaignName} • {new Date(contribution.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="font-medium text-green-600">
                                            +${contribution.amount.toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
