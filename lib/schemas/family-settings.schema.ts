/**
 * Family Settings Schema
 * 
 * Zod schema for validating family settings stored in JSONB.
 * Based on the JSON Schema specification from the requirements.
 */

import { z } from 'zod';

// Identity Settings
export const IdentitySettingsSchema = z.object({
    name: z.string().max(128).optional(),
    avatarUrl: z.string().url().nullable().optional(),
    description: z.string().max(1000).nullable().optional(),
}).optional();

// Role Permissions (custom per family)
export const RolePermissionsSchema = z.record(
    z.string().regex(/^[a-zA-Z0-9_-]{3,32}$/),
    z.object({
        canManageMembers: z.boolean().optional(),
        canEditContributions: z.boolean().optional(),
        canVerifyProofs: z.boolean().optional(),
        canImportExport: z.boolean().optional(),
        canManageReminders: z.boolean().optional(),
        canAccessDangerZone: z.boolean().optional(),
        canViewForensics: z.boolean().optional(),
    })
).optional();

// Contribution Engine Settings
export const ContributionEngineSchema = z.object({
    baseShareValueKES: z.number().min(1),
    onTimeBonusPercent: z.number().min(0),
    streakBonusPercentPer12Months: z.number().min(0),
    deadlineDayOfMonth: z.number().int().min(1).max(28),
    autoGenerateMonthlyCycle: z.boolean(),
    allowMultiplePaymentsPerCycle: z.boolean(),
    streakResetMode: z.enum(['hard_reset', 'accumulative']),
    lateWithinSameMonthCountsForStreak: z.boolean(),
});

// Visibility Rules
export const VisibilityRulesSchema = z.object({
    contributionVisibility: z.enum(['all_members', 'admins_treasurer_only', 'visible_after_expiry']).optional(),
    showTotalsOnly: z.boolean().optional(),
    leaderboardVisibility: z.enum(['public', 'admins_only', 'after_cycle']).optional(),
}).optional();

// Reminders Settings
export const RemindersSchema = z.object({
    defaultFrequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
    defaultChannel: z.enum(['whatsapp', 'email', 'both']),
    allowManualSend: z.boolean(),
});

// Danger Zone Settings
export const DangerZoneSchema = z.object({
    proofEnforcementEnabled: z.boolean(),
    allowProoflessClaims: z.boolean(),
    allowTreasurerEmergencyOverride: z.boolean(),
    leaderboardResetAllowed: z.boolean(),
    deleteGroupAllowed: z.boolean(),
});

// Governance Settings
export const GovernanceSchema = z.object({
    votingEnabled: z.boolean(),
    leadershipTermMonths: z.number().int().min(1),
    votingQuorumPercent: z.number().min(0).max(100),
    voteLoggingVisibleToAdminsOnly: z.boolean(),
});

// Platform Flags
export const PlatformFlagsSchema = z.object({
    custodyMode: z.enum(['non_custodial', 'locked_for_future', 'custodial']),
    custodyModeEditable: z.boolean(),
});

// Main Family Settings Schema
export const FamilySettingsSchema = z.object({
    groupId: z.string().uuid(),
    version: z.number().int().min(1),
    updatedAt: z.string().datetime(),

    identity: IdentitySettingsSchema,
    rolesPermissions: RolePermissionsSchema,
    contributionEngine: ContributionEngineSchema,
    visibilityRules: VisibilityRulesSchema,
    reminders: RemindersSchema,
    dangerZone: DangerZoneSchema,
    governance: GovernanceSchema,
    platformFlags: PlatformFlagsSchema,
});

export type FamilySettings = z.infer<typeof FamilySettingsSchema>;
export type IdentitySettings = z.infer<typeof IdentitySettingsSchema>;
export type ContributionEngineSettings = z.infer<typeof ContributionEngineSchema>;
export type VisibilityRulesSettings = z.infer<typeof VisibilityRulesSchema>;
export type RemindersSettings = z.infer<typeof RemindersSchema>;
export type DangerZoneSettings = z.infer<typeof DangerZoneSchema>;
export type GovernanceSettings = z.infer<typeof GovernanceSchema>;
export type PlatformFlagsSettings = z.infer<typeof PlatformFlagsSchema>;

/**
 * Default Family Settings
 * 
 * These are the default settings applied when a new family is created.
 */
export const DEFAULT_FAMILY_SETTINGS: Omit<FamilySettings, 'groupId' | 'version' | 'updatedAt'> = {
    contributionEngine: {
        baseShareValueKES: 100,
        onTimeBonusPercent: 2,
        streakBonusPercentPer12Months: 5,
        deadlineDayOfMonth: 5,
        autoGenerateMonthlyCycle: true,
        allowMultiplePaymentsPerCycle: false,
        streakResetMode: 'hard_reset',
        lateWithinSameMonthCountsForStreak: false,
    },
    reminders: {
        defaultFrequency: 'weekly',
        defaultChannel: 'whatsapp',
        allowManualSend: true,
    },
    dangerZone: {
        proofEnforcementEnabled: true,
        allowProoflessClaims: true,
        allowTreasurerEmergencyOverride: true,
        leaderboardResetAllowed: false,
        deleteGroupAllowed: false,
    },
    governance: {
        votingEnabled: false,
        leadershipTermMonths: 12,
        votingQuorumPercent: 51,
        voteLoggingVisibleToAdminsOnly: true,
    },
    platformFlags: {
        custodyMode: 'non_custodial',
        custodyModeEditable: false,
    },
};

/**
 * Validate settings against schema
 * 
 * @param settings - Settings object to validate
 * @returns Validated settings or throws ZodError
 */
export function validateFamilySettings(settings: unknown): FamilySettings {
    return FamilySettingsSchema.parse(settings);
}

/**
 * Safely validate settings and return errors
 * 
 * @param settings - Settings object to validate
 * @returns Success with data or error with issues
 */
export function safeParseFamilySettings(settings: unknown) {
    return FamilySettingsSchema.safeParse(settings);
}

/**
 * Check if settings change affects critical fields
 * 
 * Critical fields require danger zone approval workflow
 */
export function isCriticalSettingsChange(updates: Partial<FamilySettings>): boolean {
    const criticalFields = [
        'dangerZone',
        'contributionEngine.baseShareValueKES',
        'contributionEngine.streakResetMode',
        'contributionEngine.deadlineDayOfMonth',
        'governance.votingEnabled',
        'platformFlags.custodyMode',
    ];

    return criticalFields.some(field => {
        const parts = field.split('.');
        let current: any = updates;

        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                if (parts.indexOf(part) === parts.length - 1) {
                    return true; // Found the field
                }
                current = current[part];
            } else {
                return false;
            }
        }
        return false;
    });
}

/**
 * Merge settings with defaults
 * 
 * Useful for partial updates
 */
export function mergeWithDefaults(
    current: Partial<FamilySettings>,
    updates: Partial<FamilySettings>
): Partial<FamilySettings> {
    return {
        ...DEFAULT_FAMILY_SETTINGS,
        ...current,
        ...updates,
    };
}
