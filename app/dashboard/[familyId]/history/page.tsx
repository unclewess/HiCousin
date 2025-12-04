import { getArchivedCampaigns, getUserFamily, toggleCampaignStatus } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Archive, Calendar } from "lucide-react";
import Link from "next/link";
import { ReactivateButton } from "@/components/Admin/ReactivateButton";
import { ReconciliationDialog } from "@/components/Admin/ReconciliationDialog";
import { TimelineYear } from "@/components/History/TimelineComponents";

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
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/${familyId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-dark font-outfit">Campaign History</h2>
                    <p className="text-gray-mid">Timeline of completed and expired campaigns</p>
                </div>
            </div>

            {years.length === 0 ? (
                <Card variant="elevated" className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cousin-purple/10 to-cousin-pink/10 flex items-center justify-center">
                            <Archive className="w-10 h-10 text-cousin-purple" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-dark mb-2 font-outfit">No History Yet</h3>
                            <p className="text-gray-mid">Expired campaigns will appear here automatically.</p>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-12">
                    {years.map(year => (
                        <TimelineYear
                            key={year}
                            year={year}
                            months={groupedCampaigns[year]}
                            canManage={canManage}
                            familyId={familyId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
