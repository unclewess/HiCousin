'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { updateMonthlyTarget } from "@/app/actions";

interface TargetManagerProps {
    familyId: string;
    currentTarget: number;
}

export function TargetManager({ familyId, currentTarget }: TargetManagerProps) {
    const [amount, setAmount] = useState(currentTarget.toString());
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (newAmount: number) => {
        setLoading(true);
        try {
            const result = await updateMonthlyTarget(familyId, newAmount);
            if (result.success) {
                alert("Target updated successfully");
                setAmount(newAmount.toString());
            } else {
                alert(result.error || "Failed to update target");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update target");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Target</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <Button
                            onClick={() => handleUpdate(parseFloat(amount))}
                            disabled={loading}
                        >
                            Set
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Current Target: ${currentTarget > 0 ? currentTarget.toLocaleString() : 'None'}
                    </div>
                    {currentTarget > 0 && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUpdate(0)}
                            disabled={loading}
                            className="w-full"
                        >
                            Remove Target
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
