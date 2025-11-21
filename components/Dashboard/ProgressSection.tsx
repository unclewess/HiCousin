import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressSectionProps {
    totalCollected: number;
    targetAmount: number;
}

export function ProgressSection({ totalCollected, targetAmount }: ProgressSectionProps) {
    const percentage = Math.min(100, (totalCollected / targetAmount) * 100);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Goal</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Collected: ${totalCollected.toLocaleString()}</span>
                        <span>Target: ${targetAmount.toLocaleString()}</span>
                    </div>
                    <Progress value={percentage} className="h-4" />
                    <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}% Funded</p>
                </div>
            </CardContent>
        </Card>
    );
}
