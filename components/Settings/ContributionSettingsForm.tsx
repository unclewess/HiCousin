'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { updateContributionEngine } from '@/app/actions/settings';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ContributionSettingsFormProps {
    familyId: string;
    initialSettings?: {
        baseShareValueKES?: number;
        onTimeBonusPercent?: number;
        streakBonusPercentPer12Months?: number;
        deadlineDayOfMonth?: number;
        autoGenerateMonthlyCycle?: boolean;
        allowMultiplePaymentsPerCycle?: boolean;
        streakResetMode?: 'hard_reset' | 'soft_reset' | 'grace_period';
        lateWithinSameMonthCountsForStreak?: boolean;
    };
}

export function ContributionSettingsForm({ familyId, initialSettings }: ContributionSettingsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [approvalPending, setApprovalPending] = useState(false);

    const [formData, setFormData] = useState({
        baseShareValueKES: initialSettings?.baseShareValueKES || 100,
        onTimeBonusPercent: initialSettings?.onTimeBonusPercent || 0,
        streakBonusPercentPer12Months: initialSettings?.streakBonusPercentPer12Months || 0,
        deadlineDayOfMonth: initialSettings?.deadlineDayOfMonth || 5,
        autoGenerateMonthlyCycle: initialSettings?.autoGenerateMonthlyCycle ?? true,
        allowMultiplePaymentsPerCycle: initialSettings?.allowMultiplePaymentsPerCycle ?? false,
        lateWithinSameMonthCountsForStreak: initialSettings?.lateWithinSameMonthCountsForStreak ?? false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setApprovalPending(false);

        try {
            // We need to cast the result because the server action might return different shapes
            // depending on whether it's a direct update or a danger action
            const result: any = await updateContributionEngine(
                familyId,
                formData,
                'Updated via settings form'
            );

            if (result.success) {
                if (result.requiresApproval) {
                    setApprovalPending(true);
                    toast.message('Approval Required', {
                        description: result.message || 'This change requires dual approval.',
                        icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
                    });
                } else {
                    toast.success('Contribution settings updated');
                    router.refresh();
                }
            } else {
                toast.error(result.error || 'Failed to update settings');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (approvalPending) {
        return (
            <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Request Sent for Approval</AlertTitle>
                <AlertDescription className="text-orange-700">
                    Your changes involve critical financial settings and require approval from the President and Treasurer.
                    <br />
                    <Button
                        variant="ghost"
                        className="p-0 h-auto text-orange-800 underline mt-2"
                        onClick={() => setApprovalPending(false)}
                    >
                        Back to form
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="baseShareValueKES">Base Share Value (KES)</Label>
                    <Input
                        id="baseShareValueKES"
                        name="baseShareValueKES"
                        type="number"
                        value={formData.baseShareValueKES}
                        onChange={handleChange}
                        min={1}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        The standard amount for one share per month.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="deadlineDayOfMonth">Deadline Day</Label>
                    <Input
                        id="deadlineDayOfMonth"
                        name="deadlineDayOfMonth"
                        type="number"
                        value={formData.deadlineDayOfMonth}
                        onChange={handleChange}
                        min={1}
                        max={31}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Day of the month when contributions are due (1-31).
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="onTimeBonusPercent">On-Time Bonus (%)</Label>
                    <Input
                        id="onTimeBonusPercent"
                        name="onTimeBonusPercent"
                        type="number"
                        value={formData.onTimeBonusPercent}
                        onChange={handleChange}
                        min={0}
                        max={100}
                    />
                    <p className="text-xs text-muted-foreground">
                        Percentage bonus for paying before the deadline.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="streakBonusPercentPer12Months">Annual Streak Bonus (%)</Label>
                    <Input
                        id="streakBonusPercentPer12Months"
                        name="streakBonusPercentPer12Months"
                        type="number"
                        value={formData.streakBonusPercentPer12Months}
                        onChange={handleChange}
                        min={0}
                        max={100}
                    />
                    <p className="text-xs text-muted-foreground">
                        Bonus for maintaining a 12-month streak.
                    </p>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start space-x-2">
                    <Checkbox
                        id="autoGenerateMonthlyCycle"
                        checked={formData.autoGenerateMonthlyCycle}
                        onCheckedChange={(c) => handleCheckboxChange('autoGenerateMonthlyCycle', c as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="autoGenerateMonthlyCycle">Auto-generate monthly cycles</Label>
                        <p className="text-xs text-muted-foreground">
                            Automatically create contribution cycles at the start of each month.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-2">
                    <Checkbox
                        id="allowMultiplePaymentsPerCycle"
                        checked={formData.allowMultiplePaymentsPerCycle}
                        onCheckedChange={(c) => handleCheckboxChange('allowMultiplePaymentsPerCycle', c as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="allowMultiplePaymentsPerCycle">Allow partial payments</Label>
                        <p className="text-xs text-muted-foreground">
                            Allow members to make multiple small payments for a single month.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-2">
                    <Checkbox
                        id="lateWithinSameMonthCountsForStreak"
                        checked={formData.lateWithinSameMonthCountsForStreak}
                        onCheckedChange={(c) => handleCheckboxChange('lateWithinSameMonthCountsForStreak', c as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="lateWithinSameMonthCountsForStreak">Late payments count for streak</Label>
                        <p className="text-xs text-muted-foreground">
                            If paid within the same month (even if late), keep the streak alive.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
