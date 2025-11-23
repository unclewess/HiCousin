'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createCampaign } from "@/app/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface Member {
    id: string;
    fullName: string | null;
}

interface CampaignManagerProps {
    familyId: string;
    members: Member[];
}

export function CampaignManager({ familyId, members }: CampaignManagerProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [minContribution, setMinContribution] = useState("");
    const [deadline, setDeadline] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name) return;

        setLoading(true);
        try {
            const result = await createCampaign({
                familyId,
                name,
                description,
                targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
                minContribution: minContribution ? parseFloat(minContribution) : undefined,
                deadline: deadline ? new Date(deadline) : undefined,
                participantIds: selectedMembers.length > 0 ? selectedMembers : undefined
            });

            if (result.success) {
                alert("Campaign created successfully");
                setOpen(false);
                // Reset form
                setName("");
                setDescription("");
                setTargetAmount("");
                setMinContribution("");
                setDeadline("");
                setSelectedMembers([]);
            } else {
                alert(result.error || "Failed to create campaign");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to create campaign");
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedMembers.length === members.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(members.map(m => m.id));
        }
    };

    const setQuickExpiry = (type: '24h' | '1w' | '1m') => {
        const date = new Date();
        if (type === '24h') date.setDate(date.getDate() + 1);
        if (type === '1w') date.setDate(date.getDate() + 7);
        if (type === '1m') date.setMonth(date.getMonth() + 1);
        setDeadline(date.toISOString().split('T')[0]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-32 flex flex-col items-center justify-center gap-2" variant="outline">
                    <Plus className="h-8 w-8" />
                    <span className="font-semibold">Create New Campaign</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                        Set up a new fundraising goal for your family.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Campaign Name</label>
                        <Input
                            placeholder="e.g. December Get-Together"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Textarea
                            placeholder="What is this campaign for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Amount ($) (Optional)</label>
                            <Input
                                type="number"
                                placeholder="Leave empty for no limit"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Min. Contribution ($) (Optional)</label>
                            <Input
                                type="number"
                                placeholder="Optional minimum"
                                value={minContribution}
                                onChange={(e) => setMinContribution(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Deadline (Optional)</label>
                        <div className="flex gap-2 mb-2">
                            <Button size="sm" variant="outline" onClick={() => setQuickExpiry('24h')}>24 Hours</Button>
                            <Button size="sm" variant="outline" onClick={() => setQuickExpiry('1w')}>1 Week</Button>
                            <Button size="sm" variant="outline" onClick={() => setQuickExpiry('1m')}>1 Month</Button>
                        </div>
                        <Input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Participants</label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all"
                                    checked={selectedMembers.length === members.length && members.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                                <label
                                    htmlFor="select-all"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Select All
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-4 max-h-40 overflow-y-auto">
                            {members.map((m) => (
                                <div key={m.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={m.id}
                                        checked={selectedMembers.includes(m.id)}
                                        onCheckedChange={() => toggleMember(m.id)}
                                    />
                                    <label
                                        htmlFor={m.id}
                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {m.fullName}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            If no participants are selected, all active members will be included by default.
                        </p>
                    </div>

                    <Button onClick={handleCreate} disabled={loading || !name} className="w-full">
                        {loading ? "Creating..." : "Create Campaign"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
