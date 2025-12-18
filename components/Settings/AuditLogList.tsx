'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '@/app/actions/audit';
import { flagAuditEntry } from '@/app/actions/disputes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, Filter, Eye, AlertTriangle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { SEVERITY_COLORS, SEVERITY_ICONS, AuditSeverity } from '@/lib/audit/severity-config';
import { maskIpAddress, getImpactIndicators } from '@/lib/audit/diff-utils';
import { markdownToHtml } from '@/lib/audit/message-templates';
import { AuditLogDetailModal } from './AuditLogDetailModal';
import { cn } from '@/lib/utils';

interface AuditLogListProps {
    familyId: string;
    userRole: 'PRESIDENT' | 'TREASURER' | 'MEMBER';
}

interface AuditLogEntry {
    id: string;
    action: string;
    entityType: string;
    severity: AuditSeverity;
    affectsMoney: boolean;
    affectsStreaks: boolean;
    affectsRules: boolean;
    humanSummary: string | null;
    createdAt: string | Date;
    ipAddress: string | null;
    actor: {
        id: string;
        fullName: string | null;
        email: string;
    };
    actorRole: string | null;
    beforeState: any;
    afterState: any;
    deviceInfo: any;
    reason: string | null;
    disputes?: any[];
}

export function AuditLogList({ familyId, userRole }: AuditLogListProps) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
    const limit = 15;

    const isPresident = userRole === 'PRESIDENT';

    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAuditLogs(familyId, {
                limit,
                offset: page * limit,
                entityType: filterType === 'all' ? undefined : filterType,
            });

            if (result.success && result.data) {
                // Transform response to include defaults for legacy logs
                let transformedLogs = (result.data as any[]).map(log => ({
                    ...log,
                    severity: log.severity || 'INFO',
                    affectsMoney: log.affectsMoney ?? false,
                    affectsStreaks: log.affectsStreaks ?? false,
                    affectsRules: log.affectsRules ?? false,
                    humanSummary: log.humanSummary || null,
                    createdAt: log.createdAt.toString(),
                })) as AuditLogEntry[];

                // Filter by severity on client (could move to server)
                if (filterSeverity !== 'all') {
                    transformedLogs = transformedLogs.filter(log => log.severity === filterSeverity);
                }
                setLogs(transformedLogs);
            }
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setLoading(false);
        }
    }, [familyId, page, filterType, filterSeverity]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const getSeverityBadge = (severity: AuditSeverity) => {
        const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.INFO;
        const icon = SEVERITY_ICONS[severity] || '📋';

        return (
            <span className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                colors.bg,
                colors.text
            )}>
                <span>{icon}</span>
                <span>{severity}</span>
            </span>
        );
    };

    const getImpactBadges = (log: AuditLogEntry) => {
        const indicators = getImpactIndicators(
            log.affectsMoney,
            log.affectsStreaks,
            log.affectsRules
        );

        return (
            <div className="flex gap-1">
                {indicators.map((ind, idx) => (
                    <span
                        key={idx}
                        className="text-sm cursor-help"
                        title={ind.label}
                    >
                        {ind.emoji}
                    </span>
                ))}
            </div>
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Filter:</span>
                </div>

                <Select value={filterSeverity} onValueChange={(v) => { setFilterSeverity(v); setPage(0); }}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="INFO">🔵 Info</SelectItem>
                        <SelectItem value="LOW">🔵 Low</SelectItem>
                        <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                        <SelectItem value="HIGH">🟠 High</SelectItem>
                        <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(0); }}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Entity Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="proof">💳 Proofs</SelectItem>
                        <SelectItem value="contribution">💰 Contributions</SelectItem>
                        <SelectItem value="settings">⚙️ Settings</SelectItem>
                        <SelectItem value="danger_action">⚠️ Danger Actions</SelectItem>
                        <SelectItem value="campaign">📢 Campaigns</SelectItem>
                    </SelectContent>
                </Select>

                {/* Pagination */}
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">Page {page + 1}</span>
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

            {/* Table */}
            <div className="rounded-lg border bg-white overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Action
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actor
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Impact
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Severity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Details
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Loading audit logs...</p>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                    <AlertTriangle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                    <p className="text-sm">No audit logs found with current filters.</p>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="max-w-xs">
                                            <p
                                                className="text-sm text-gray-900 line-clamp-2"
                                                dangerouslySetInnerHTML={{
                                                    __html: markdownToHtml(log.humanSummary || log.action)
                                                }}
                                            />
                                            <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                                {log.entityType.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">
                                                {log.actor?.fullName || 'Unknown'}
                                            </span>
                                            <span className="text-xs text-gray-500 capitalize">
                                                {log.actorRole?.toLowerCase() || 'Member'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getImpactBadges(log)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getSeverityBadge(log.severity)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                        {formatDate(log.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedLog(log);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <AuditLogDetailModal
                    log={selectedLog}
                    isPresident={isPresident}
                    onClose={() => setSelectedLog(null)}
                    onFlag={async () => {
                        const reason = window.prompt('Please provide a reason for flagging this action:');
                        if (reason) {
                            await flagAuditEntry(selectedLog.id, reason);
                            setSelectedLog(null);
                            loadLogs(); // Refresh after flagging
                        }
                    }}
                />
            )}
        </div>
    );
}

export default AuditLogList;
