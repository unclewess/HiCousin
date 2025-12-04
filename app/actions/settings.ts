/**
 * Settings Server Actions
 * 
 * Server actions for managing family settings with permission checks,
 * validation, and audit logging.
 */

'use server';

import prisma from '@/lib/db';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions';
import {
    FamilySettingsSchema,
    DEFAULT_FAMILY_SETTINGS,
    validateFamilySettings,
    isCriticalSettingsChange,
    type FamilySettings
} from '@/lib/schemas/family-settings.schema';
import { createAuditLog, auditSettingsChange } from '@/lib/audit/logger';

/**
 * Get family settings
 * 
 * @param familyId - Family ID
 * @returns Family settings or null
 */
export async function getFamilySettings(familyId: string) {
    try {
        // Check permission
        await requirePermission(familyId, PERMISSIONS.VIEW_GROUP_SETTINGS);

        // Get settings from database
        let settingsRecord = await prisma.familySettings.findUnique({
            where: { familyId },
        });

        // Initialize if doesn't exist
        if (!settingsRecord) {
            const { userId } = await requirePermission(familyId, PERMISSIONS.EDIT_GROUP_IDENTITY);
            settingsRecord = await initializeFamilySettings(familyId, userId);
        }

        return {
            success: true,
            data: settingsRecord,
        };
    } catch (error: any) {
        console.error('Error getting family settings:', error);
        return {
            success: false,
            error: error.message || 'Failed to get settings',
        };
    }
}

/**
 * Update family settings
 * 
 * @param familyId - Family ID
 * @param updates - Partial settings updates
 * @param reason - Reason for update (required for critical changes)
 * @returns Updated settings or error
 */
export async function updateFamilySettings(
    familyId: string,
    updates: Partial<FamilySettings>,
    reason?: string
) {
    try {
        // Check permission
        const { userId, role } = await requirePermission(familyId, PERMISSIONS.EDIT_GROUP_IDENTITY);

        // Get current settings
        const current = await prisma.familySettings.findUnique({
            where: { familyId },
        });

        if (!current) {
            return {
                success: false,
                error: 'Settings not found. Please initialize first.',
            };
        }

        // Merge with current settings
        const currentSettings = current.settings as any;
        const newSettings = {
            ...currentSettings,
            ...updates,
            groupId: familyId,
            version: (current.version || 0) + 1,
            updatedAt: new Date().toISOString(),
        };

        // Validate against schema
        try {
            validateFamilySettings(newSettings);
        } catch (validationError: any) {
            return {
                success: false,
                error: 'Invalid settings',
                details: validationError.errors,
            };
        }

        // Check if this is a critical change
        const isCritical = isCriticalSettingsChange(updates);

        if (isCritical) {
            // Create danger action for critical changes
            const { createDangerAction } = await import('./danger');

            const dangerResult = await createDangerAction(
                familyId,
                'update_critical_settings',
                {
                    updates,
                    currentSettings,
                    newSettings,
                },
                reason || 'Critical settings update'
            );

            if (!dangerResult.success) {
                return {
                    success: false,
                    error: 'Failed to create danger action for critical change',
                    details: dangerResult.error,
                };
            }

            return {
                success: true,
                requiresApproval: true,
                dangerActionId: dangerResult.data?.id,
                message: 'Critical settings change requires dual approval',
            };
        }

        // Update version history
        const versionHistory = [
            ...(Array.isArray(current.versionHistory) ? current.versionHistory : []),
            {
                version: newSettings.version,
                changedBy: userId,
                changedAt: new Date().toISOString(),
                changes: Object.keys(updates),
                isCritical,
            },
        ];

        // Update settings
        const updated = await prisma.familySettings.update({
            where: { familyId },
            data: {
                settings: newSettings,
                version: newSettings.version,
                versionHistory,
                updatedBy: userId,
            },
        });

        // Create audit log
        await auditSettingsChange(
            familyId,
            'UPDATED',
            userId,
            role,
            currentSettings,
            newSettings,
            reason
        );

        return {
            success: true,
            data: updated,
            isCritical,
        };
    } catch (error: any) {
        console.error('Error updating family settings:', error);
        return {
            success: false,
            error: error.message || 'Failed to update settings',
        };
    }
}

/**
 * Initialize family settings
 * 
 * Creates default settings for a new family
 * 
 * @param familyId - Family ID
 * @param userId - User ID who is initializing
 * @returns Created settings
 */
export async function initializeFamilySettings(familyId: string, userId: string) {
    const settings = {
        ...DEFAULT_FAMILY_SETTINGS,
        groupId: familyId,
        version: 1,
        updatedAt: new Date().toISOString(),
    };

    const created = await prisma.familySettings.create({
        data: {
            familyId,
            settings,
            version: 1,
            versionHistory: [{
                version: 1,
                changedBy: userId,
                changedAt: new Date().toISOString(),
                changes: ['initialized'],
                isCritical: false,
            }],
            updatedBy: userId,
        },
    });

    // Create audit log
    await createAuditLog({
        familyId,
        entityType: 'settings',
        entityId: created.id,
        action: 'INITIALIZED',
        actorId: userId,
        afterState: settings,
    });

    return created;
}

/**
 * Get settings version history
 * 
 * @param familyId - Family ID
 * @returns Version history
 */
export async function getSettingsHistory(familyId: string) {
    try {
        await requirePermission(familyId, PERMISSIONS.VIEW_FORENSICS);

        const settings = await prisma.familySettings.findUnique({
            where: { familyId },
            select: {
                versionHistory: true,
                version: true,
            },
        });

        if (!settings) {
            return {
                success: false,
                error: 'Settings not found',
            };
        }

        return {
            success: true,
            data: {
                currentVersion: settings.version,
                history: settings.versionHistory,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to get settings history',
        };
    }
}

/**
 * Rollback settings to a previous version
 * 
 * @param familyId - Family ID
 * @param targetVersion - Version to rollback to
 * @param reason - Reason for rollback
 * @returns Rolled back settings
 */
export async function rollbackSettings(
    familyId: string,
    targetVersion: number,
    reason: string
) {
    try {
        const { userId, role } = await requirePermission(familyId, PERMISSIONS.PERFORM_DANGER_ACTION);

        // Get current settings
        const current = await prisma.familySettings.findUnique({
            where: { familyId },
        });

        if (!current) {
            return {
                success: false,
                error: 'Settings not found',
            };
        }

        // Find the target version in history
        const history = Array.isArray(current.versionHistory) ? current.versionHistory : [];
        const targetHistoryEntry = history.find((h: any) => h.version === targetVersion);

        if (!targetHistoryEntry) {
            return {
                success: false,
                error: `Version ${targetVersion} not found in history`,
            };
        }

        // TODO: Implement actual rollback logic
        // This would require storing full settings snapshots in version history
        // For now, just log the attempt

        await createAuditLog({
            familyId,
            entityType: 'settings',
            entityId: current.id,
            action: 'ROLLBACK_ATTEMPTED',
            actorId: userId,
            actorRole: role,
            reason: `Attempted rollback to version ${targetVersion}: ${reason}`,
        });

        return {
            success: false,
            error: 'Rollback not yet implemented. Full snapshots required.',
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to rollback settings',
        };
    }
}

/**
 * Update specific settings category
 * 
 * Convenience functions for updating specific sections
 */
export async function updateContributionEngine(
    familyId: string,
    updates: Partial<FamilySettings['contributionEngine']>,
    reason?: string
) {
    return updateFamilySettings(familyId, { contributionEngine: updates as any }, reason);
}

export async function updateVisibilityRules(
    familyId: string,
    updates: Partial<FamilySettings['visibilityRules']>,
    reason?: string
) {
    return updateFamilySettings(familyId, { visibilityRules: updates }, reason);
}

export async function updateReminders(
    familyId: string,
    updates: Partial<FamilySettings['reminders']>,
    reason?: string
) {
    return updateFamilySettings(familyId, { reminders: updates as any }, reason);
}

export async function updateDangerZone(
    familyId: string,
    updates: Partial<FamilySettings['dangerZone']>,
    reason: string // Required for danger zone changes
) {
    return updateFamilySettings(familyId, { dangerZone: updates as any }, reason);
}
