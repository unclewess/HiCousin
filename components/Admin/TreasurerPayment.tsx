'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordPayment } from "@/app/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DollarSign, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Member {
    id: string;
    fullName: string | null;
}

interface Campaign {
    id: string;
    name: string;
}

interface TreasurerPaymentProps {
    familyId: string;
    members: Member[];
    campaigns?: Campaign[];
}

export function TreasurerPayment({ familyId, members, campaigns = [] }: TreasurerPaymentProps) {
    const [open, setOpen] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string>("");
    const [selectedCampaign, setSelectedCampaign] = useState<string>("GENERAL");
    const [amount, setAmount] = useState("100");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const handleRecord = async () => {
        if (!selectedMember) return;

        setLoading(true);
        try {
            const result = await recordPayment(
                familyId,
                selectedMember,
                parseFloat(amount),
                new Date(date),
                selectedCampaign === "GENERAL" ? undefined : selectedCampaign
            );

            if (result.success) {
                alert("Payment recorded successfully");
                setOpen(false);
                // Reset form
                setAmount("100");
                setSelectedMember("");
                setSelectedCampaign("GENERAL");
            } else {
                alert(result.error || "Failed to record payment");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to record payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-32 flex flex-col items-center justify-center gap-2" variant="outline">
                    <DollarSign className="h-8 w-8" />
                    <span className="font-semibold">Record Payment</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-gray-dark overflow-visible">
                <DialogHeader>
                    <DialogTitle>Record Manual Payment</DialogTitle>
                    <DialogDescription>
                        Record a contribution for a member.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-medium">Member</label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                >
                                    {selectedMember
                                        ? members.find((member) => member.id === selectedMember)?.fullName
                                        : "Select member..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0 bg-white">
                                <Command>
                                    <CommandInput placeholder="Search member..." />
                                    <CommandList>
                                        <CommandEmpty>No member found.</CommandEmpty>
                                        <CommandGroup>
                                            {members.map((member) => (
                                                <CommandItem
                                                    key={member.id}
                                                    value={member.fullName || ""}
                                                    onSelect={() => {
                                                        setSelectedMember(member.id)
                                                        setOpenCombobox(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedMember === member.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {member.fullName}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Campaign</label>
                        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select campaign" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GENERAL">General Fund / Monthly Dues</SelectItem>
                                {campaigns.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount ($)</label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <Button onClick={handleRecord} disabled={loading || !selectedMember} className="w-full">
                        {loading ? "Recording..." : "Record Payment"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
