'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Contribution {
    id: string;
    amount: number;
    date: Date;
    memberName: string | null;
    campaignName: string;
    status: string;
}

interface DownloadReportButtonProps {
    contributions: Contribution[];
}

export function DownloadReportButton({ contributions }: DownloadReportButtonProps) {
    const handleDownload = () => {
        // 1. Prepare CSV Content
        const headers = ["Member Name", "Campaign/Type", "Amount", "Date", "Status"];
        const rows = contributions.map(c => [
            c.memberName || "Unknown",
            c.campaignName,
            c.amount.toFixed(2),
            new Date(c.date).toLocaleDateString(),
            c.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // 2. Create Blob and Download Link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `contributions_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
        </Button>
    );
}
