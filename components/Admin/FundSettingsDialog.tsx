'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateFundSettings } from "@/app/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";

interface FundSettingsDialogProps {
    familyId: string;
    currentTarget: number;
    currentMin: number;
}

export function FundSettingsDialog({ familyId, currentTarget, currentMin }: FundSettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [target, setTarget] = useState(currentTarget.toString());
    const [min, setMin] = useState(currentMin.toString());
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const result = await updateFundSettings(familyId, parseFloat(target), parseFloat(min));
            if (result.success) {
                alert("Settings updated successfully");
                setOpen(false);
            } else {
                alert(result.error || "Failed to update settings");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Fund
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-gray-dark">
                <DialogHeader>
                    <DialogTitle>General Fund Settings</DialogTitle>
                    <DialogDescription>
                        Configure monthly targets and minimum contributions.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Monthly Target ($)</label>
                        <Input
                            type="number"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The total amount the family aims to collect this month.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Monthly Contribution ($)</label>
                        <Input
                            type="number"
                            value={min}
                            onChange={(e) => setMin(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The minimum amount each member is expected to contribute per month.
                        </p>
                    </div>

                    <Button onClick={handleUpdate} disabled={loading} className="w-full">
                        {loading ? "Updating..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
