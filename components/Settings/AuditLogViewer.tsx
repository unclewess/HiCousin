'use client';

import React from 'react';
import { AuditLogList } from './AuditLogList';

interface AuditLogViewerProps {
    familyId: string;
    userRole?: 'PRESIDENT' | 'TREASURER' | 'MEMBER';
}

/**
 * Audit Log Viewer Component
 * 
 * Displays a human-readable audit log with:
 * - Severity badges (INFO, LOW, MEDIUM, HIGH, CRITICAL)
 * - Impact indicators (💰 Money, 🔥 Streaks, 📋 Rules)
 * - Human-readable action summaries
 * - Before/After diff tables
 * - Role-based visibility (IP masking for non-Presidents)
 */
export function AuditLogViewer({ familyId, userRole = 'MEMBER' }: AuditLogViewerProps) {
    return (
        <AuditLogList
            familyId={familyId}
            userRole={userRole}
        />
    );
}

export default AuditLogViewer;
