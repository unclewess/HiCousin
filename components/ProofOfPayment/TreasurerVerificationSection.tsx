import { getPendingProofs } from "@/app/actions/proofs";
import { VerificationQueue } from "./VerificationQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShieldAlert } from "lucide-react";

interface TreasurerVerificationSectionProps {
    familyId: string;
}

export async function TreasurerVerificationSection({ familyId }: TreasurerVerificationSectionProps) {
    const pendingProofs = await getPendingProofs(familyId);

    if (pendingProofs.length === 0) return null;

    return (
        <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Pending Verifications ({pendingProofs.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <VerificationQueue proofs={pendingProofs.map((p: any) => ({
                    ...p,
                    amount: Number(p.amount)
                }))} />
            </CardContent>
        </Card>
    );
}
