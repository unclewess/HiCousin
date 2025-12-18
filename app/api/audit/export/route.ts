/**
 * Audit Log PDF Export API
 * 
 * Generates a branded PDF for a single audit log entry.
 * Uses simple HTML-to-PDF conversion with HiCousins styling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { computeDiff, formatDeviceInfo } from '@/lib/audit/diff-utils';
import { stripMarkdown } from '@/lib/audit/message-templates';
import { SEVERITY_COLORS, SEVERITY_ICONS, AuditSeverity } from '@/lib/audit/severity-config';

export async function GET(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const auditLogId = searchParams.get('id');

    if (!auditLogId) {
        return NextResponse.json({ error: 'Missing audit log ID' }, { status: 400 });
    }

    try {
        // Get the audit log with actor details
        const auditLog = await prisma.auditLog.findUnique({
            where: { id: auditLogId },
            include: {
                actor: {
                    select: { id: true, fullName: true, email: true }
                },
                family: {
                    select: { name: true }
                }
            }
        });

        if (!auditLog) {
            return NextResponse.json({ error: 'Audit log not found' }, { status: 404 });
        }

        // Check user has access to this family
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const member = await prisma.familyMember.findUnique({
            where: {
                familyId_userId: {
                    familyId: auditLog.familyId,
                    userId: dbUser.id
                }
            }
        });

        if (!member) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Generate PDF-like HTML
        const diffs = computeDiff(auditLog.beforeState as any, auditLog.afterState as any);
        const severity = auditLog.severity as AuditSeverity;
        const icon = SEVERITY_ICONS[severity] || '📋';

        const html = generateAuditPdfHtml({
            familyName: auditLog.family.name,
            actorName: auditLog.actor.fullName || 'Unknown',
            actorRole: auditLog.actorRole || 'Member',
            action: auditLog.action,
            entityType: auditLog.entityType,
            severity: auditLog.severity,
            severityIcon: icon,
            humanSummary: stripMarkdown(auditLog.humanSummary || auditLog.action),
            affectsMoney: auditLog.affectsMoney,
            affectsStreaks: auditLog.affectsStreaks,
            affectsRules: auditLog.affectsRules,
            diffs,
            device: formatDeviceInfo(auditLog.deviceInfo),
            createdAt: auditLog.createdAt,
            auditLogId: auditLog.id,
            reason: auditLog.reason,
        });

        // Return HTML that can be printed as PDF
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `inline; filename="audit-${auditLogId.slice(0, 8)}.html"`,
            },
        });

    } catch (error: any) {
        console.error('Error generating audit PDF:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}

interface AuditPdfData {
    familyName: string;
    actorName: string;
    actorRole: string;
    action: string;
    entityType: string;
    severity: string;
    severityIcon: string;
    humanSummary: string;
    affectsMoney: boolean;
    affectsStreaks: boolean;
    affectsRules: boolean;
    diffs: { field: string; before: string | null; after: string | null }[];
    device: string;
    createdAt: Date;
    auditLogId: string;
    reason: string | null;
}

function generateAuditPdfHtml(data: AuditPdfData): string {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const impactBadges = [
        data.affectsMoney && '💰 Financial Records',
        data.affectsStreaks && '🔥 Contribution Streaks',
        data.affectsRules && '📋 Family Rules',
    ].filter(Boolean).join(' &nbsp;•&nbsp; ') || '📝 Informational Only';

    const severityColors: Record<string, string> = {
        'INFO': '#6b7280',
        'LOW': '#3b82f6',
        'MEDIUM': '#f59e0b',
        'HIGH': '#f97316',
        'CRITICAL': '#ef4444',
    };

    const diffRows = data.diffs.map(d => `
        <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${d.field}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${d.before || '—'}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${d.after || '—'}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Log - ${data.auditLogId.slice(0, 8)}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif; 
            color: #1f2937; 
            background: #fff;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        @media print {
            body { padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb;">
        <div>
            <h1 style="font-size: 24px; font-weight: 700; color: #7c3aed;">HiCousins</h1>
            <p style="font-size: 12px; color: #6b7280;">Audit Log Report</p>
        </div>
        <div style="text-align: right;">
            <p style="font-size: 14px; font-weight: 500;">${data.familyName}</p>
            <p style="font-size: 12px; color: #6b7280;">Generated: ${formatDate(new Date())}</p>
        </div>
    </div>

    <!-- Summary Section -->
    <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h2 style="font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 12px; letter-spacing: 0.5px;">What Happened</h2>
        <p style="font-size: 16px; line-height: 1.6;">${data.humanSummary}</p>
    </div>

    <!-- Metadata -->
    <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
        <div style="flex: 1; min-width: 200px;">
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Performed By</p>
            <p style="font-size: 14px; font-weight: 500;">${data.actorName} (${data.actorRole})</p>
        </div>
        <div style="flex: 1; min-width: 200px;">
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Date & Time</p>
            <p style="font-size: 14px; font-weight: 500;">${formatDate(data.createdAt)}</p>
        </div>
        <div style="flex: 1; min-width: 200px;">
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Severity</p>
            <p style="font-size: 14px; font-weight: 600; color: ${severityColors[data.severity] || '#6b7280'};">${data.severityIcon} ${data.severity}</p>
        </div>
        <div style="flex: 1; min-width: 200px;">
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Device</p>
            <p style="font-size: 14px;">${data.device}</p>
        </div>
    </div>

    <!-- Impact -->
    <div style="margin-bottom: 24px;">
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Impact Areas</p>
        <p style="font-size: 14px;">${impactBadges}</p>
    </div>

    ${data.reason ? `
    <!-- Reason -->
    <div style="margin-bottom: 24px; background: #fef3c7; border-radius: 8px; padding: 12px 16px;">
        <p style="font-size: 12px; color: #92400e; margin-bottom: 4px;">Reason Provided</p>
        <p style="font-size: 14px; font-style: italic;">"${data.reason}"</p>
    </div>
    ` : ''}

    <!-- Changes Table -->
    ${data.diffs.length > 0 ? `
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 12px; letter-spacing: 0.5px;">What Changed</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <thead style="background: #f3f4f6;">
                <tr>
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #4b5563;">Setting</th>
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #4b5563;">Before</th>
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #4b5563;">After</th>
                </tr>
            </thead>
            <tbody>${diffRows}</tbody>
        </table>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
        <p>Audit Log ID: ${data.auditLogId}</p>
        <p style="margin-top: 4px;">This document was generated by HiCousins and represents an official audit record.</p>
        <p style="margin-top: 8px;" class="no-print">
            <a href="javascript:window.print()" style="color: #7c3aed;">Print or Save as PDF</a>
        </p>
    </div>
</body>
</html>`;
}
