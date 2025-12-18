'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createDangerAction, approveDangerAction, rejectDangerAction } from '@/app/actions/danger';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, Trash2, RefreshCw, ShieldAlert, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

interface DangerZoneProps {
    familyId: string;
    settings?: any;
    pendingActions?: any[];
    currentUserId: string;
    currentUserRole: string;
}

export function DangerZone({ familyId, settings, pendingActions = [], currentUserId, currentUserRole }: DangerZoneProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [dialogOpen, setDialogOpen] = useState<string | null>(null);

    const handleCreateAction = async (actionType: string) => {
        if (!reason.trim()) {
            toast.error('Please provide a reason');
            return;
        }

        setLoading(actionType);
        try {
            const result = await createDangerAction(
                familyId,
                actionType,
                { timestamp: Date.now() },
                reason
            );

            if (result.success) {
                toast.success('Action requested successfully');
                setDialogOpen(null);
                setReason('');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to request action');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(null);
        }
    };

    const handleApprove = async (actionId: string) => {
        setLoading(actionId);
        try {
            const result = await approveDangerAction(actionId, 'Approved via Danger Zone');
            if (result.success) {
                toast.success(result.allApproved ? 'Action fully approved!' : 'Action approved');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to approve');
            }
        } catch (error) {
            toast.error('Error approving action');
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async (actionId: string) => {
        setLoading(actionId);
        try {
            const result = await rejectDangerAction(actionId, 'Rejected via Danger Zone');
            if (result.success) {
                toast.success('Action rejected');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to reject');
            }
        } catch (error) {
            toast.error('Error rejecting action');
        } finally {
            setLoading(null);
        }
    };

    const canApprove = (action: any) => {
        // Check if user is a required approver and hasn't approved yet
        const required = action.requiredApprovals.find((r: any) => r.userId === currentUserId || r.role === currentUserRole);
        if (!required) return false;

        const alreadyApproved = action.approvals?.some((a: any) => a.userId === currentUserId);
        return !alreadyApproved;
    };

    return (
        <div className="space-y-8">
            {/* Pending Actions Section */}
            {pendingActions.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center text-orange-600">
                        <ShieldAlert className="mr-2 h-5 w-5" />
                        Pending Approvals
                    </h3>
                    <div className="grid gap-4">
                        {pendingActions.map((action) => (
                            <Card key={action.id} className="border-orange-200 bg-orange-50/50">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base font-medium">
                                                {action.actionType.replace(/_/g, ' ').toUpperCase()}
                                            </CardTitle>
                                            <CardDescription>
                                                Requested by {action.requester?.fullName} • {new Date(action.createdAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={action.status === 'APPROVED' ? 'default' : 'secondary'}>
                                            {action.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-sm bg-white p-3 rounded border border-orange-100">
                                            <span className="font-semibold">Reason:</span> {action.reason}
                                        </div>

                                        {/* Progress Bar for Approvals could go here */}

                                        {canApprove(action) && (
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleReject(action.id)}
                                                    disabled={loading === action.id}
                                                >
                                                    <X className="mr-1 h-4 w-4" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleApprove(action.id)}
                                                    disabled={loading === action.id}
                                                >
                                                    {loading === action.id ? (
                                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Check className="mr-1 h-4 w-4" />
                                                    )}
                                                    Approve
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Danger Actions List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600">Critical Actions</h3>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Reset Leaderboard */}
                    <Card className="border-red-100">
                        <CardHeader>
                            <CardTitle className="text-base">Reset Leaderboard</CardTitle>
                            <CardDescription>
                                Clear all contribution streaks and points. Financial records remain.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={dialogOpen === 'reset_leaderboard'} onOpenChange={(open) => setDialogOpen(open ? 'reset_leaderboard' : null)}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Request Reset
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Request Leaderboard Reset</DialogTitle>
                                        <DialogDescription>
                                            This action requires approval from the President and Treasurer.
                                            It cannot be undone once executed.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2 py-4">
                                        <Label>Reason for reset</Label>
                                        <Input
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="e.g. Starting new year cycle"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setDialogOpen(null)}>Cancel</Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleCreateAction('reset_leaderboard')}
                                            disabled={loading === 'reset_leaderboard'}
                                        >
                                            {loading === 'reset_leaderboard' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Request Reset
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    {/* Delete Group */}
                    <Card className="border-red-100 bg-red-50/10">
                        <CardHeader>
                            <CardTitle className="text-base text-red-700">Delete Family Group</CardTitle>
                            <CardDescription>
                                Permanently delete this group and all associated data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={dialogOpen === 'delete_group'} onOpenChange={(open) => setDialogOpen(open ? 'delete_group' : null)}>
                                <DialogTrigger asChild>
                                    <Button variant="danger" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Request Deletion
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Request Group Deletion</DialogTitle>
                                        <DialogDescription>
                                            This is an extremely critical action. It requires dual approval and a 48-hour cooling period.
                                            All data will be permanently lost.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2 py-4">
                                        <Label>Reason for deletion</Label>
                                        <Input
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="e.g. Group is no longer active"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setDialogOpen(null)}>Cancel</Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleCreateAction('delete_group')}
                                            disabled={loading === 'delete_group'}
                                        >
                                            {loading === 'delete_group' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Request Deletion
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
