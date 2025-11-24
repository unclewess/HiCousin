import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface ProgressSectionProps {
    totalCollected: number;
    targetAmount: number;
}

export function ProgressSection({ totalCollected, targetAmount }: ProgressSectionProps) {
    const percentage = targetAmount > 0 ? Math.min(100, (totalCollected / targetAmount) * 100) : 0;

    return (
        <Card className="overflow-visible mt-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-cousin-purple font-fun">Monthly Goal</CardTitle>
            </CardHeader>
            <CardContent>
                {targetAmount > 0 ? (
                    <div className="pt-4 pb-2">
                        <ProgressBar
                            progress={percentage}
                            targetAmount={targetAmount}
                            currentAmount={totalCollected}
                            showMascot={true}
                        />
                    </div>
                ) : (
                    <p className="text-sm text-gray-mid italic">No monthly goal set.</p>
                )}
            </CardContent>
        </Card>
    );
}
