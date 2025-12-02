'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { payContribution } from "@/app/actions";
import { DollarSign } from 'lucide-react';

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
                <Button variant="primary" leftIcon={<DollarSign size={16} />}>
                    Make Contribution
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-rounded shadow-medium border-none">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-fun text-cousin-purple text-center">
                        Contribute to Family Fund
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-dark">Amount ($)</label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-lg font-bold text-center h-12 border-2 border-gray-light focus:border-cousin-green focus:ring-cousin-green/20"
                        />
                        <p className="text-xs text-gray-mid text-center">
                            Standard contribution is $100
                        </p>
                    </div>
                    <Button
                        onClick={handlePay}
                        disabled={loading}
                        className="w-full h-12 text-lg"
                        variant="primary"
                        isLoading={loading}
                    >
                        Pay Now
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
