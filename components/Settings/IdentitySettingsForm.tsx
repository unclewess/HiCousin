'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateFamilySettings } from '@/app/actions/settings';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface IdentitySettingsFormProps {
    familyId: string;
    initialSettings?: {
        name?: string;
        description?: string;
        avatarUrl?: string;
        theme?: string;
    };
}

export function IdentitySettingsForm({ familyId, initialSettings }: IdentitySettingsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialSettings?.name || '',
        description: initialSettings?.description || '',
        avatarUrl: initialSettings?.avatarUrl || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateFamilySettings(familyId, {
                identity: {
                    ...initialSettings,
                    ...formData,
                },
            });

            if (result.success) {
                toast.success('Identity settings updated');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update settings');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Family Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. The Smith Cousins"
                    required
                />
                <p className="text-sm text-muted-foreground">
                    The public name of your family group.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="A brief description of your group..."
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                />
                <p className="text-sm text-muted-foreground">
                    Link to an image for your group icon.
                </p>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
