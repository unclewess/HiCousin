import { getArchivedCampaigns, getUserFamily, toggleCampaignStatus } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, RefreshCw, Archive } from "lucide-react";
import Link from "next/link";
import { ReactivateButton } from "@/components/Admin/ReactivateButton";
import { ReconciliationDialog } from "@/components/Admin/ReconciliationDialog";

interface PageProps {
    params: Promise<{ familyId: string }>;
}

export default async function HistoryPage({ params }: PageProps) {
    const { familyId } = await params;
    const groupedCampaigns = await getArchivedCampaigns(familyId);
    const userFamily = await getUserFamily(familyId);
    const canManage = userFamily?.role === 'PRESIDENT' || userFamily?.role === 'TREASURER';

    const years = Object.keys(groupedCampaigns).map(Number).sort((a, b) => b - a);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/${familyId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-dark font-fun">Past Campaigns</h2>
                    <p className="text-gray-mid">History of completed and expired campaigns.</p>
                </div>
            </div>

            {years.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl shadow-soft-drop">
                    <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-dark mb-2">No History Yet</h3>
                    <p className="text-gray-mid">Expired campaigns will appear here automatically.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {years.map(year => (
                        <div key={year} className="space-y-6">
                            <h3 className="text-2xl font-bold text-cousin-purple font-fun border-b border-gray-200 pb-2">
                                {year}
                            </h3>
                            <div className="space-y-8">
                                {Object.entries(groupedCampaigns[year]).map(([month, campaigns]) => (
                                    <div key={month} className="space-y-4">
                                        <h4 className="text-lg font-bold text-gray-mid uppercase tracking-wider pl-4 border-l-4 border-cousin-blue">
                                            {month}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {campaigns.map((campaign: any) => (
                                                <Card key={campaign.id} className="bg-white shadow-medium border-none opacity-90 hover:opacity-100 transition-opacity">
                                                    <CardHeader className="pb-2 flex flex-row justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-xl font-bold text-gray-dark font-fun">
                                                                {campaign.name}
                                                            </CardTitle>
                                                            <p className="text-sm text-gray-mid mt-1 line-clamp-2">
                                                                {campaign.description || "No description"}
                                                            </p>
                                                        </div>
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                                                            Closed
                                                        </Badge>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-mid">Target</span>
                                                                <span className="font-bold text-gray-dark">
                                                                    {campaign.targetAmount ? `$${campaign.targetAmount.toLocaleString()}` : 'No Limit'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-mid">Deadline</span>
                                                                <span className="font-bold text-gray-dark">
                                                                    {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'None'}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2 mt-4">
                                                                <ReconciliationDialog
                                                                    familyId={familyId}
                                                                    campaign={campaign}
                                                                    canManage={canManage}
                                                                />
                                                                {canManage && (
                                                                    <ReactivateButton
                                                                        familyId={familyId}
                                                                        campaignId={campaign.id}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
