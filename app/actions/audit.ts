'use server';

import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions';
import { getFamilyAuditLogs } from '@/lib/audit/logger';

/**
 * Get audit logs for a family
 * 
 * @param familyId - Family ID
 * @param options - Query options
 * @returns Audit logs
 */
export async function getAuditLogs(
    familyId: string,
    options?: {
        entityType?: string;
        action?: string;
        actorId?: string;
        limit?: number;
        offset?: number;
    }
) {
    try {
        // Check permission
        await requirePermission(familyId, PERMISSIONS.VIEW_FORENSICS);

        const logs = await getFamilyAuditLogs(familyId, options);

        return {
            success: true,
            data: logs,
        };
    } catch (error: any) {
        console.error('Error getting audit logs:', error);
        return {
            success: false,
            error: error.message || 'Failed to get audit logs',
        };
    }
}
