/**
 * Audit Severity Configuration
 * 
 * Hardcoded mapping of actions to severity levels and impact flags.
 * This determines how audit log entries are displayed and prioritized.
 */

export const AUDIT_SEVERITY = {
    INFO: 'INFO',       // Gray - Viewed, logged in, routine actions
    LOW: 'LOW',         // Blue - Minor settings changes
    MEDIUM: 'MEDIUM',   // Yellow - Rule updates, deadlines
    HIGH: 'HIGH',       // Orange - Financial record edits
    CRITICAL: 'CRITICAL' // Red - Deletions, overrides, danger actions
} as const;

export type AuditSeverity = keyof typeof AUDIT_SEVERITY;

export interface SeverityConfig {
    severity: AuditSeverity;
    affectsMoney: boolean;
    affectsStreaks: boolean;
    affectsRules: boolean;
}

/**
 * Maps action strings to their severity and impact configuration.
 * Add new actions here as the system grows.
 */
export const ACTION_SEVERITY_MAP: Record<string, SeverityConfig> = {
    // ============================================
    // Settings Actions
    // ============================================
    'SETTINGS_CREATED': { severity: 'LOW', affectsMoney: false, affectsStreaks: false, affectsRules: true },
    'SETTINGS_UPDATED': { severity: 'MEDIUM', affectsMoney: false, affectsStreaks: false, affectsRules: true },
    'REMINDER_CHANGED': { severity: 'LOW', affectsMoney: false, affectsStreaks: false, affectsRules: true },
    'VISIBILITY_CHANGED': { severity: 'MEDIUM', affectsMoney: false, affectsStreaks: false, affectsRules: true },
    'GOVERNANCE_CHANGED': { severity: 'HIGH', affectsMoney: false, affectsStreaks: false, affectsRules: true },

    // ============================================
    // Contribution Actions
    // ============================================
    'CONTRIBUTION_CREATED': { severity: 'LOW', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'CONTRIBUTION_UPDATED': { severity: 'HIGH', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'CONTRIBUTION_EDITED': { severity: 'HIGH', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'CONTRIBUTION_DELETED': { severity: 'CRITICAL', affectsMoney: true, affectsStreaks: true, affectsRules: false },

    // ============================================
    // Proof of Payment Actions
    // ============================================
    'PROOF_SUBMITTED': { severity: 'INFO', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'PROOF_CREATED': { severity: 'INFO', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'PROOF_APPROVED': { severity: 'MEDIUM', affectsMoney: true, affectsStreaks: true, affectsRules: false },
    'PROOF_REJECTED': { severity: 'MEDIUM', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'PROOF_DISPUTED': { severity: 'HIGH', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'PROOF_ESCALATED': { severity: 'HIGH', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'PROOF_OVERRIDDEN': { severity: 'CRITICAL', affectsMoney: true, affectsStreaks: true, affectsRules: false },

    // ============================================
    // Streak Actions
    // ============================================
    'STREAK_UPDATED': { severity: 'MEDIUM', affectsMoney: false, affectsStreaks: true, affectsRules: false },
    'STREAK_RESET': { severity: 'CRITICAL', affectsMoney: false, affectsStreaks: true, affectsRules: false },
    'STREAK_OVERRIDE': { severity: 'CRITICAL', affectsMoney: false, affectsStreaks: true, affectsRules: false },

    // ============================================
    // Campaign Actions
    // ============================================
    'CAMPAIGN_CREATED': { severity: 'LOW', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'CAMPAIGN_UPDATED': { severity: 'MEDIUM', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'CAMPAIGN_ARCHIVED': { severity: 'MEDIUM', affectsMoney: true, affectsStreaks: false, affectsRules: false },
    'CAMPAIGN_DELETED': { severity: 'CRITICAL', affectsMoney: true, affectsStreaks: false, affectsRules: false },

    // ============================================
    // Member/Role Actions
    // ============================================
    'MEMBER_INVITED': { severity: 'INFO', affectsMoney: false, affectsStreaks: false, affectsRules: false },
    'MEMBER_JOINED': { severity: 'INFO', affectsMoney: false, affectsStreaks: false, affectsRules: false },
    'MEMBER_REMOVED': { severity: 'HIGH', affectsMoney: false, affectsStreaks: false, affectsRules: true },
    'ROLE_CHANGED': { severity: 'HIGH', affectsMoney: false, affectsStreaks: false, affectsRules: true },
    'ROLE_ASSIGNED': { severity: 'HIGH', affectsMoney: false, affectsStreaks: false, affectsRules: true },

    // ============================================
    // Danger Zone Actions
    // ============================================
    'DANGER_ACTION_REQUESTED': { severity: 'HIGH', affectsMoney: true, affectsStreaks: true, affectsRules: true },
    'DANGER_ACTION_APPROVED': { severity: 'CRITICAL', affectsMoney: true, affectsStreaks: true, affectsRules: true },
    'DANGER_ACTION_REJECTED': { severity: 'MEDIUM', affectsMoney: false, affectsStreaks: false, affectsRules: false },
    'DANGER_ACTION_EXECUTED': { severity: 'CRITICAL', affectsMoney: true, affectsStreaks: true, affectsRules: true },
    'DANGER_ACTION_CANCELLED': { severity: 'LOW', affectsMoney: false, affectsStreaks: false, affectsRules: false },

    // ============================================
    // Generic/Fallback Actions
    // ============================================
    'CREATED': { severity: 'INFO', affectsMoney: false, affectsStreaks: false, affectsRules: false },
    'UPDATED': { severity: 'LOW', affectsMoney: false, affectsStreaks: false, affectsRules: false },
    'EDITED': { severity: 'MEDIUM', affectsMoney: false, affectsStreaks: false, affectsRules: false },
    'DELETED': { severity: 'HIGH', affectsMoney: false, affectsStreaks: false, affectsRules: false },
    'DEFAULT': { severity: 'INFO', affectsMoney: false, affectsStreaks: false, affectsRules: false },
};

/**
 * Get severity configuration for an action
 */
export function getSeverityConfig(action: string): SeverityConfig {
    return ACTION_SEVERITY_MAP[action] || ACTION_SEVERITY_MAP['DEFAULT'];
}

/**
 * Severity colors for UI display
 */
export const SEVERITY_COLORS: Record<AuditSeverity, { bg: string; text: string; border: string }> = {
    INFO: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
    LOW: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

/**
 * Severity icons for UI display
 */
export const SEVERITY_ICONS: Record<AuditSeverity, string> = {
    INFO: '📋',
    LOW: '🔵',
    MEDIUM: '🟡',
    HIGH: '🟠',
    CRITICAL: '🔴',
};
