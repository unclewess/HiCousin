import { getSettingsData } from "@/app/actions";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/Admin/SettingsForm";

interface SettingsPageProps {
    params: Promise<{ familyId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
    const { familyId } = await params;
    const data = await getSettingsData(familyId);

    if (!data) {
        redirect(`/dashboard/${familyId}`);
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Family Settings</h2>
                <p className="text-muted-foreground">Manage your family group configuration.</p>
            </div>
            <SettingsForm family={data.family} />
        </div>
    );
}
