'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { payContribution } from "@/app/actions";

interface ContributionFormProps {
    familyId: string;
}

export function ContributionForm({ familyId }: ContributionFormProps) {
    const [amount, setAmount] = useState("100");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        try {
            const result = await payContribution(familyId, parseFloat(amount));
            if (result.success) {
                setOpen(false);
                // Ideally we'd show a toast here
            } else {
                alert(result.error || "Payment failed");
            }
        } catch (e) {
            console.error(e);
            alert("Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">Make Contribution</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Contribute to Family Fund</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount ($)</label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <Button onClick={handlePay} disabled={loading} className="w-full">
                        {loading ? "Processing..." : "Pay Now"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
