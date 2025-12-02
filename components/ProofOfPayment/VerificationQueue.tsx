"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { verifyProof } from "@/app/actions/proofs";
import { toast } from "sonner";
import { Check, ExternalLink, AlertTriangle, MessageSquare, Users, Loader2, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Proof {
    id: string;
    amount: number;
    currency: string;
    paymentChannel: string;
    transactionRef: string | null;
    paymentDate: Date;
    imageUrl: string | null;
    rawMessage: string | null;
    fraudScore: number;
    isProofless: boolean;
    user: {
        fullName: string | null;
        avatarUrl: string | null;
    };
    beneficiaries: Array<{
        userId: string;
        allocatedAmount: number;
        user: {
            fullName: string | null;
        };
    }>;
}

interface VerificationQueueProps {
    proofs: Proof[];
}

export function VerificationQueue({ proofs }: VerificationQueueProps) {
    const [processingId, setProcessingId] = useState<string | null>(null);

    async function handleVerify(proofId: string, status: "APPROVED" | "REJECTED") {
        setProcessingId(proofId);

        let reason = undefined;
        if (status === "REJECTED") {
            reason = prompt("Enter rejection reason:");
            if (!reason) {
                setProcessingId(null);
                return; // Cancelled
            }
        }

        const result = await verifyProof(proofId, status, reason);

        if (result && result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Proof ${status.toLowerCase()} successfully`);
        }
        setProcessingId(null);
    }

    if (proofs.length === 0) {
        return (
            <Card className="bg-muted/50 border-dashed">
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Check className="w-12 h-12 mb-2 text-green-500 opacity-50" />
                    <p>All caught up! No pending proofs.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {proofs.map((proof) => (
                <Card key={proof.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                        {/* Evidence Preview (Image or Message Icon) */}
                        <div className="w-full md:w-32 flex-shrink-0">
                            {proof.imageUrl ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative w-full h-32 cursor-pointer hover:opacity-90 transition-opacity rounded-md overflow-hidden bg-muted">
                                            <Image
                                                src={proof.imageUrl}
                                                alt="Proof"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
                                                <ExternalLink className="text-white opacity-0 hover:opacity-100 drop-shadow-md" />
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                                        <div className="relative w-full h-[80vh]">
                                            <Image
                                                src={proof.imageUrl}
                                                alt="Proof Full"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <div className="w-full h-32 rounded-md bg-muted flex flex-col items-center justify-center text-muted-foreground p-2 text-center border border-border">
                                    {proof.isProofless ? (
                                        <>
                                            <AlertTriangle className="w-8 h-8 mb-1 text-yellow-500" />
                                            <span className="text-xs font-medium text-yellow-600">Proofless Claim</span>
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare className="w-8 h-8 mb-1" />
                                            <span className="text-xs">Message Based</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-foreground">{proof.user.fullName}</h4>
                                        {proof.fraudScore > 20 && (
                                            <Badge variant="outline" className={cn(
                                                "text-xs",
                                                proof.fraudScore > 50 ? "border-red-200 bg-red-50 text-red-700" : "border-yellow-200 bg-yellow-50 text-yellow-700"
                                            )}>
                                                Risk: {proof.fraudScore}%
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{new Date(proof.paymentDate).toLocaleDateString()}</p>
                                </div>
                                <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                                    {proof.currency} {Number(proof.amount).toLocaleString()}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Channel:</span>
                                    <span className="ml-2 font-medium">{proof.paymentChannel}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Ref:</span>
                                    <span className="ml-2 font-mono bg-muted px-1 rounded">
                                        {proof.transactionRef || "N/A"}
                                    </span>
                                </div>
                            </div>

                            {/* Message Content */}
                            {proof.rawMessage && (
                                <div className="mt-2 bg-muted/50 p-2 rounded text-xs font-mono text-muted-foreground break-all border border-border">
                                    {proof.rawMessage}
                                </div>
                            )}

                            {/* Beneficiaries */}
                            {proof.beneficiaries.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                                        <Users className="w-3 h-3" />
                                        <span>Split Payment ({proof.beneficiaries.length} beneficiaries)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {proof.beneficiaries.map(b => (
                                            <Badge key={b.userId} variant="secondary" className="text-xs font-normal">
                                                {b.user.fullName}: {Number(b.allocatedAmount).toLocaleString()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 justify-center min-w-[120px]">
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                                onClick={() => handleVerify(proof.id, "APPROVED")}
                                disabled={!!processingId}
                            >
                                {processingId === proof.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="danger"
                                className="w-full md:w-auto"
                                onClick={() => handleVerify(proof.id, "REJECTED")}
                                disabled={!!processingId}
                            >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
