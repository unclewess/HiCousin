'use client';

import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/app/actions/audit';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AuditLogViewerProps {
    familyId: string;
}

export function AuditLogViewer({ familyId }: AuditLogViewerProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [filterType, setFilterType] = useState<string>('all');
    const limit = 20;

    const loadLogs = async () => {
        setLoading(true);
        try {
            const result = await getAuditLogs(familyId, {
                limit,
                offset: page * limit,
                entityType: filterType === 'all' ? undefined : filterType,
            });

            if (result.success && result.data) {
                setLogs(result.data);
            }
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, [familyId, page, filterType]);

    const formatState = (state: any) => {
        if (!state) return 'N/A';
        return JSON.stringify(state, null, 2);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(0); }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="proof">Proof</SelectItem>
                            <SelectItem value="settings">Settings</SelectItem>
                            <SelectItem value="danger_action">Danger Action</SelectItem>
                            <SelectItem value="contribution">Contribution</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page + 1}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={logs.length < limit || loading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Actor</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{log.actor?.fullName || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">{log.actorRole}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.action}</Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">{log.entityType.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Audit Log Details</DialogTitle>
                                                    <DialogDescription>
                                                        ID: {log.id} • IP: {log.ipAddress || 'Unknown'}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold mb-2">Before State</h4>
                                                            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                                                                {formatState(log.beforeState)}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold mb-2">After State</h4>
                                                            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                                                                {formatState(log.afterState)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                    {log.reason && (
                                                        <div>
                                                            <h4 className="font-semibold mb-1">Reason</h4>
                                                            <p className="text-sm text-muted-foreground">{log.reason}</p>
                                                        </div>
                                                    )}
                                                    {log.deviceInfo && (
                                                        <div>
                                                            <h4 className="font-semibold mb-1">Device Info</h4>
                                                            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                                                {JSON.stringify(log.deviceInfo, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
