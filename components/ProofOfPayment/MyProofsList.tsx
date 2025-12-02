"use client";

import { useEffect, useState } from "react";
import { getMyProofs } from "@/app/actions/proofs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

import { DisputeDialog } from "./DisputeDialog";

interface MyProofsListProps {
    familyId: string;
    refreshTrigger?: number;
}

export function MyProofsList({ familyId, refreshTrigger }: MyProofsListProps) {
    const [proofs, setProofs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProofs();
    }, [familyId, refreshTrigger]);

    async function loadProofs() {
        setLoading(true);
        const data = await getMyProofs(familyId);
        setProofs(data);
        setLoading(false);
    }

    if (loading) {
        return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>;
    }

    if (proofs.length === 0) {
        return <div className="text-center text-sm text-gray-500 p-4">No proofs submitted yet.</div>;
    }

    return (
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-4">
                {proofs.map((proof) => (
                    <div key={proof.id} className="flex flex-col gap-2 border-b pb-2 last:border-0">
                        <div className="flex items-center justify-between text-sm">
                            <div>
                                <p className="font-medium">{proof.currency} {Number(proof.amount).toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{new Date(proof.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 hidden sm:inline">{proof.transactionRef || 'Manual'}</span>
                                <Badge variant={
                                    proof.status === "APPROVED" ? "default" :
                                        proof.status === "REJECTED" ? "destructive" :
                                            proof.status === "DISPUTED" ? "outline" : "secondary"
                                } className={proof.status === "DISPUTED" ? "text-orange-600 border-orange-200 bg-orange-50" : ""}>
                                    {proof.status}
                                </Badge>
                            </div>
                        </div>

                        {proof.status === "REJECTED" && (
                            <div className="flex items-center justify-between bg-red-50 p-2 rounded text-xs">
                                <span className="text-red-600 truncate max-w-[200px]">
                                    Reason: {proof.rejectionReason}
                                </span>
                                <DisputeDialog proofId={proof.id} rejectionReason={proof.rejectionReason} />
                            </div>
                        )}

                        {proof.status === "DISPUTED" && (
                            <div className="bg-orange-50 p-2 rounded text-xs text-orange-700">
                                Dispute under review
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
