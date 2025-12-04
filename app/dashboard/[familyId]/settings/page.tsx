import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getFamilySettings } from '@/app/actions/settings';
import { getPendingDangerActions } from '@/app/actions/danger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings, Wallet, Eye, Bell, Gavel, AlertTriangle, FileText } from 'lucide-react';
import prisma from '@/lib/db';

// Components
import { IdentitySettingsForm } from '@/components/Settings/IdentitySettingsForm';
import { ContributionSettingsForm } from '@/components/Settings/ContributionSettingsForm';
import { DangerZone } from '@/components/Settings/DangerZone';
import { AuditLogViewer } from '@/components/Settings/AuditLogViewer';

export default async function SettingsPage({ params }: { params: Promise<{ familyId: string }> }) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) redirect('/sign-in');

    const { familyId } = await params;

    // Get database user ID from Clerk ID
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true }
    });

    if (!dbUser) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>User not found in database</AlertDescription>
                </Alert>
            </div>
        );
    }

    // Fetch data in parallel
    const [settingsResult, dangerActionsResult, member] = await Promise.all([
        getFamilySettings(familyId),
        getPendingDangerActions(familyId),
        prisma.familyMember.findUnique({
            where: { familyId_userId: { familyId, userId: dbUser.id } }
        })
    ]);

    if (!settingsResult.success) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{settingsResult.error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const settings = settingsResult.data?.settings;
    const pendingActions = dangerActionsResult.success ? dangerActionsResult.data : [];
    const currentUserRole = member?.role || 'MEMBER';

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Family Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your family group preferences and rules.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="identity" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto">
                    <TabsTrigger value="identity" className="py-2">
                        <Settings className="mr-2 h-4 w-4" />
                        Identity
                    </TabsTrigger>
                    <TabsTrigger value="contribution" className="py-2">
                        <Wallet className="mr-2 h-4 w-4" />
                        Contribution
                    </TabsTrigger>
                    <TabsTrigger value="visibility" className="py-2">
                        <Eye className="mr-2 h-4 w-4" />
                        Visibility
                    </TabsTrigger>
                    <TabsTrigger value="reminders" className="py-2">
                        <Bell className="mr-2 h-4 w-4" />
                        Reminders
                    </TabsTrigger>
                    <TabsTrigger value="governance" className="py-2">
                        <Gavel className="mr-2 h-4 w-4" />
                        Governance
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="py-2">
                        <FileText className="mr-2 h-4 w-4" />
                        Audit Logs
                    </TabsTrigger>
                    <TabsTrigger value="danger" className="py-2 text-red-500 data-[state=active]:text-red-600">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Danger Zone
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identity Settings</CardTitle>
                            <CardDescription>
                                Manage your family group's name, description, and appearance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IdentitySettingsForm familyId={familyId} initialSettings={(settings as any)?.identity} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contribution" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contribution Engine</CardTitle>
                            <CardDescription>
                                Configure share values, bonuses, and deadlines.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ContributionSettingsForm familyId={familyId} initialSettings={(settings as any)?.contributionEngine} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="visibility" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visibility Rules</CardTitle>
                            <CardDescription>
                                Control who can see what within the family group.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">Visibility form coming soon...</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reminders" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reminders & Notifications</CardTitle>
                            <CardDescription>
                                Configure automated reminders and notification channels.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">Reminders form coming soon...</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="governance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Governance</CardTitle>
                            <CardDescription>
                                Set up voting rules and terms of service.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">Governance form coming soon...</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Logs</CardTitle>
                            <CardDescription>
                                View a detailed history of all actions and changes in your family group.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AuditLogViewer familyId={familyId} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="danger" className="space-y-4">
                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>
                                Critical actions that affect the entire family group.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DangerZone
                                familyId={familyId}
                                settings={(settings as any)?.dangerZone}
                                pendingActions={pendingActions}
                                currentUserId={clerkUserId}
                                currentUserRole={currentUserRole}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
