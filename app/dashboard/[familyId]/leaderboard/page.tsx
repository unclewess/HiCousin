import { getLeaderboardData } from "@/app/actions";
import { LeaderboardClient } from "@/components/Leaderboard/LeaderboardClient";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ familyId: string }>;
}

export default async function LeaderboardPage({ params }: PageProps) {
    const { familyId } = await params;

    // Default to current month
    const leaderboardData = await getLeaderboardData(familyId);

    if (!leaderboardData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Unable to load leaderboard data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/${familyId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>
            </div>

            <LeaderboardClient
                familyId={familyId}
                activeMembers={leaderboardData.activeMembers}
                inactiveMembers={leaderboardData.inactiveMembers}
                metrics={leaderboardData.metrics}
            />
        </div>
    );
}
