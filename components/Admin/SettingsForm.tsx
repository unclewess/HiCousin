'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateFamilyName, regenerateInviteCode } from "@/app/actions";
import { useRouter } from 'next/navigation';

interface SettingsFormProps {
    family: {
        id: string;
        name: string;
        code: string;
    };
}

export function SettingsForm({ family }: SettingsFormProps) {
    const [name, setName] = useState(family.name);
    const [code, setCode] = useState(family.code);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdateName = async () => {
        setLoading(true);
        const res = await updateFamilyName(family.id, name);
        setLoading(false);
        if (res.success) {
            alert("Family name updated!");
            router.refresh();
        } else {
            alert("Failed to update name");
        }
    };

    const handleRegenerateCode = async () => {
        if (!confirm("Are you sure? The old code will stop working.")) return;
        setLoading(true);
        const res = await regenerateInviteCode(family.id);
        setLoading(false);
        if (res.success && res.newCode) {
            setCode(res.newCode);
            alert("Invite code regenerated!");
            router.refresh();
        } else {
            alert("Failed to regenerate code");
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Update your family's display name.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Family Name</label>
                        <div className="flex gap-2">
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                            <Button onClick={handleUpdateName} disabled={loading}>Save</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invite Code</CardTitle>
                    <CardDescription>Manage the code used to join this family.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Code</label>
                        <div className="flex items-center gap-4">
                            <div className="text-2xl font-mono font-bold tracking-wider bg-muted p-2 rounded">
                                {code}
                            </div>
                            <Button variant="danger" onClick={handleRegenerateCode} disabled={loading}>
                                Regenerate Code
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Regenerating the code will invalidate the previous one.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
