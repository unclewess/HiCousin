/**
 * Audit Logging Utility
 * 
 * Provides functions to create audit logs for tracking all system changes.
 * All audit logs are append-only and include context like IP address and device info.
 */

import prisma from '@/lib/db';
import { headers } from 'next/headers';

export interface AuditLogInput {
    familyId: string;
    entityType: string; // 'proof', 'contribution', 'settings', 'danger_action', etc.
    entityId?: string;
    action: string; // 'CREATED', 'EDITED', 'APPROVED', 'REJECTED', 'OVERRIDDEN', etc.
    actorId: string;
    actorRole?: string;
    beforeState?: any;
    afterState?: any;
    reason?: string;
    requestId?: string;
}

/**
 * Create an audit log entry
 * 
 * @param input - Audit log data
 * @returns Created audit log
 */
export async function createAuditLog(input: AuditLogInput) {
    try {
        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
        const userAgent = headersList.get('user-agent');

        return await prisma.auditLog.create({
            data: {
                familyId: input.familyId,
                entityType: input.entityType,
                entityId: input.entityId,
                action: input.action,
                actorId: input.actorId,
                actorRole: input.actorRole,
                beforeState: input.beforeState,
                afterState: input.afterState,
                reason: input.reason,
                ipAddress: ipAddress || undefined,
                deviceInfo: userAgent ? { userAgent } : undefined,
                requestId: input.requestId || crypto.randomUUID(),
            },
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't throw - audit logging should not break the main flow
        return null;
    }
}

/**
 * Get audit logs for a specific entity
 * 
 * @param entityType - Type of entity
 * @param entityId - ID of the entity
 * @returns Array of audit logs
 */
export async function getEntityAuditLogs(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
        where: {
            entityType,
            entityId,
        },
        include: {
            actor: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

/**
 * Get audit logs for a family
 * 
 * @param familyId - Family ID
 * @param options - Query options
 * @returns Array of audit logs
 */
export async function getFamilyAuditLogs(
    familyId: string,
    options?: {
        entityType?: string;
        action?: string;
        actorId?: string;
        limit?: number;
        offset?: number;
    }
) {
    return prisma.auditLog.findMany({
        where: {
            familyId,
            ...(options?.entityType && { entityType: options.entityType }),
            ...(options?.action && { action: options.action }),
            ...(options?.actorId && { actorId: options.actorId }),
        },
        include: {
            actor: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: options?.limit || 100,
        skip: options?.offset || 0,
    });
}

/**
 * Create audit log for proof actions
 * 
 * Convenience function for proof-related audit logs
 */
export async function auditProofAction(
    proofId: string,
    familyId: string,
    action: string,
    actorId: string,
    actorRole: string,
    beforeState?: any,
    afterState?: any,
    reason?: string
) {
    return createAuditLog({
        familyId,
        entityType: 'proof',
        entityId: proofId,
        action,
        actorId,
        actorRole,
        beforeState,
        afterState,
        reason,
    });
}

/**
 * Create audit log for settings changes
 */
export async function auditSettingsChange(
    familyId: string,
    action: string,
    actorId: string,
    actorRole: string,
    beforeState?: any,
    afterState?: any,
    reason?: string
) {
    return createAuditLog({
        familyId,
        entityType: 'settings',
        action,
        actorId,
        actorRole,
        beforeState,
        afterState,
        reason,
    });
}

/**
 * Create audit log for danger actions
 */
export async function auditDangerAction(
    dangerActionId: string,
    familyId: string,
    action: string,
    actorId: string,
    actorRole: string,
    beforeState?: any,
    afterState?: any,
    reason?: string
) {
    return createAuditLog({
        familyId,
        entityType: 'danger_action',
        entityId: dangerActionId,
        action,
        actorId,
        actorRole,
        beforeState,
        afterState,
        reason,
    });
}
