'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { toggleCampaignStatus } from "@/app/actions";
import { RefreshCw } from "lucide-react";

interface ReactivateButtonProps {
    familyId: string;
    campaignId: string;
}

export function ReactivateButton({ familyId, campaignId }: ReactivateButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleReactivate = async () => {
        if (!confirm("Are you sure you want to reactivate this campaign? It will reappear on the dashboard.")) return;

        setLoading(true);
        try {
            const result = await toggleCampaignStatus(familyId, campaignId, 'ACTIVE');
            if (result.success) {
                // Success
            } else {
                alert(result.error || "Failed to reactivate");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to reactivate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 border-cousin-blue text-cousin-blue hover:bg-cousin-blue/10"
            onClick={handleReactivate}
            disabled={loading}
            isLoading={loading}
            leftIcon={<RefreshCw size={14} />}
        >
            Reactivate
        </Button>
    );
}
