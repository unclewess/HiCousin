'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ChevronDown,
    ChevronUp,
    Flag,
    AlertTriangle,
    Download,
    Monitor,
    Code
} from 'lucide-react';
import { SEVERITY_COLORS, SEVERITY_ICONS, AuditSeverity } from '@/lib/audit/severity-config';
import {
    computeDiff,
    isInitialCreation,
    getBeforeStateLabel,
    maskIpAddress,
    formatDeviceInfo,
    getImpactIndicators,
    DiffEntry
} from '@/lib/audit/diff-utils';
import { markdownToHtml } from '@/lib/audit/message-templates';
import { cn } from '@/lib/utils';

interface AuditLogDetailModalProps {
    log: {
        id: string;
        action: string;
        entityType: string;
        severity: AuditSeverity;
        affectsMoney: boolean;
        affectsStreaks: boolean;
        affectsRules: boolean;
        humanSummary: string | null;
        createdAt: string;
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
    };
    isPresident: boolean;
    onClose: () => void;
    onFlag?: () => void;
}

export function AuditLogDetailModal({ log, isPresident, onClose, onFlag }: AuditLogDetailModalProps) {
    const [showMetadata, setShowMetadata] = useState(false);
    const [showRawJson, setShowRawJson] = useState(false);

    const colors = SEVERITY_COLORS[log.severity] || SEVERITY_COLORS.INFO;
    const icon = SEVERITY_ICONS[log.severity] || '📋';
    const impactIndicators = getImpactIndicators(log.affectsMoney, log.affectsStreaks, log.affectsRules);

    const isInitial = isInitialCreation(log.beforeState);
    const diffs = computeDiff(log.beforeState, log.afterState);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        });
    };

    const getImpactSummary = () => {
        const impacts: string[] = [];
        if (log.affectsMoney) impacts.push('financial records');
        if (log.affectsStreaks) impacts.push('contribution streaks');
        if (log.affectsRules) impacts.push('family rules');

        if (impacts.length === 0) return 'This action is informational and did not change any critical data.';
        return `This action affected: ${impacts.join(', ')}.`;
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className={cn('text-lg', colors.text)}>{icon}</span>
                        <span>Audit Log Details</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        ID: {log.id.slice(0, 8)}... • {formatDate(log.createdAt)}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Section 1: Human-Readable Summary */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            What Happened
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 border">
                            <p
                                className="text-base text-gray-900"
                                dangerouslySetInnerHTML={{
                                    __html: markdownToHtml(log.humanSummary || log.action)
                                }}
                            />
                            <p className="text-sm text-gray-600 mt-2">
                                {getImpactSummary()}
                            </p>
                        </div>

                        {/* Severity & Impact Badges */}
                        <div className="flex flex-wrap gap-2">
                            <span className={cn(
                                'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                                colors.bg, colors.text
                            )}>
                                {icon} {log.severity} Severity
                            </span>
                            {impactIndicators.map((ind, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700"
                                >
                                    {ind.emoji} {ind.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Section 2: Before vs After Diff */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            {isInitial ? 'Initial Values' : 'What Changed'}
                        </h3>

                        {diffs.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-4 border text-center text-gray-500">
                                No field changes detected.
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">Setting</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">
                                                {isInitial ? '—' : 'Before'}
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">
                                                {isInitial ? 'Value' : 'After'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {diffs.map((diff, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium text-gray-900">
                                                    {diff.field}
                                                </td>
                                                <td className="px-4 py-2 text-gray-500">
                                                    {isInitial ? (
                                                        <span className="text-gray-300 italic">Initial</span>
                                                    ) : (
                                                        diff.before || <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-gray-900 font-medium">
                                                    {diff.after || <span className="text-gray-300">—</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Raw JSON Toggle */}
                        <button
                            onClick={() => setShowRawJson(!showRawJson)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                            <Code className="h-3 w-3" />
                            {showRawJson ? 'Hide' : 'View'} raw JSON (advanced)
                        </button>

                        {showRawJson && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Before State</p>
                                    <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-40">
                                        {log.beforeState ? JSON.stringify(log.beforeState, null, 2) : 'null'}
                                    </pre>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">After State</p>
                                    <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-40">
                                        {log.afterState ? JSON.stringify(log.afterState, null, 2) : 'null'}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 3: Metadata (Collapsible) */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowMetadata(!showMetadata)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            {showMetadata ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <Monitor className="h-4 w-4" />
                            <span>Technical Details</span>
                        </button>

                        {showMetadata && (
                            <div className="bg-gray-50 rounded-lg p-4 border text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">IP Address:</span>
                                    <span className="text-gray-900 font-mono">
                                        {isPresident ? (log.ipAddress || 'Unknown') : maskIpAddress(log.ipAddress)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Device:</span>
                                    <span className="text-gray-900">
                                        {formatDeviceInfo(log.deviceInfo)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Actor Email:</span>
                                    <span className="text-gray-900">
                                        {isPresident ? log.actor.email : '***@***.***'}
                                    </span>
                                </div>
                                {log.reason && (
                                    <div className="pt-2 border-t mt-2">
                                        <span className="text-gray-500">Reason Given:</span>
                                        <p className="text-gray-900 mt-1 italic">"{log.reason}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Section 4: Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        {(log.severity === 'HIGH' || log.severity === 'CRITICAL') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onFlag}
                                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                                <Flag className="h-4 w-4 mr-1" />
                                Flag This Action
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                            onClick={() => {
                                window.open(`/api/audit/export?id=${log.id}`, '_blank');
                            }}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Export PDF
                        </Button>
                        <Button variant="primary" size="sm" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AuditLogDetailModal;
