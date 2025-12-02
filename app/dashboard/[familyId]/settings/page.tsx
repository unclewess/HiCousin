import { getSettingsData, updateFamilyName, regenerateInviteCode } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/Admin/SettingsForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ familyId: string }>;
}

export default async function SettingsPage({ params }: PageProps) {
    const { familyId } = await params;
    const data = await getSettingsData(familyId);

    if (!data) {
        redirect(`/dashboard/${familyId}`);
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/${familyId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-dark font-fun">Family Settings</h2>
                    <p className="text-gray-mid">Manage your family configuration.</p>
                </div>
            </div>
            <SettingsForm family={data.family} />
        </div>
    );
}
