"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { disputeProof } from "@/app/actions/proofs";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

interface DisputeDialogProps {
    proofId: string;
    rejectionReason: string | null;
}

export function DisputeDialog({ proofId, rejectionReason }: DisputeDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {
        if (!reason.trim()) {
            toast.error("Please provide a reason for the dispute");
            return;
        }

        setIsSubmitting(true);
        const result = await disputeProof(proofId, reason);
        setIsSubmitting(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Dispute submitted successfully");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700">
                    Dispute
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Dispute Rejection</DialogTitle>
                    <DialogDescription>
                        Explain why this rejection is incorrect. This will be escalated to the Treasurer.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-50 p-3 rounded-md border border-red-100 mb-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-red-800">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{rejectionReason || "No reason provided"}</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason for Dispute</Label>
                        <Textarea
                            id="reason"
                            placeholder="I actually paid this via..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Dispute
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
