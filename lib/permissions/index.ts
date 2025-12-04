/**
 * Permission Constants
 * 
 * Defines all available permissions in the HiCousins system.
 * These are used for role-based access control (RBAC).
 */

export const PERMISSIONS = {
    // View permissions
    VIEW_GROUP_SETTINGS: 'viewGroupSettings',
    VIEW_FORENSICS: 'viewForensics',
    VIEW_VOTING_LOGS: 'viewVotingLogs',
    VIEW_MEMBERS: 'viewMembers',
    VIEW_CAMPAIGNS: 'viewCampaigns',

    // Edit permissions
    EDIT_GROUP_IDENTITY: 'editGroupIdentity',
    MANAGE_ROLES: 'manageRoles',
    MANAGE_CAMPAIGNS: 'manageCampaigns',

    // Contribution permissions
    CREATE_CONTRIBUTIONS: 'createContributions',
    EDIT_CONTRIBUTIONS: 'editContributions',
    OVERRIDE_CONTRIBUTIONS: 'overrideContributions',

    // Proof permissions
    VERIFY_PROOFS: 'verifyProofs',
    SUBMIT_PROOF: 'submitProof',

    // Admin permissions
    IMPORT_EXPORT: 'importExport',
    MANAGE_REMINDERS: 'manageReminders',
    ACCESS_DANGER_ZONE: 'accessDangerZone',
    PERFORM_DANGER_ACTION: 'performDangerAction',

    // Special permissions
    DELETE_GROUP: 'deleteGroup',
    PLATFORM_OVERRIDE: 'platformOverride',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Default Permission Matrix
 * 
 * Defines which permissions each role has by default.
 * This is used to seed the role_permissions table.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
    PRESIDENT: [
        PERMISSIONS.VIEW_GROUP_SETTINGS,
        PERMISSIONS.VIEW_MEMBERS,
        PERMISSIONS.VIEW_CAMPAIGNS,
        PERMISSIONS.EDIT_GROUP_IDENTITY,
        PERMISSIONS.MANAGE_ROLES,
        PERMISSIONS.MANAGE_CAMPAIGNS,
        PERMISSIONS.CREATE_CONTRIBUTIONS,
        PERMISSIONS.EDIT_CONTRIBUTIONS,
        PERMISSIONS.OVERRIDE_CONTRIBUTIONS,
        PERMISSIONS.VERIFY_PROOFS,
        PERMISSIONS.SUBMIT_PROOF,
        PERMISSIONS.IMPORT_EXPORT,
        PERMISSIONS.MANAGE_REMINDERS,
        PERMISSIONS.ACCESS_DANGER_ZONE,
        PERMISSIONS.PERFORM_DANGER_ACTION,
        PERMISSIONS.VIEW_FORENSICS,
        PERMISSIONS.VIEW_VOTING_LOGS,
        PERMISSIONS.DELETE_GROUP,
    ],
    TREASURER: [
        PERMISSIONS.VIEW_GROUP_SETTINGS,
        PERMISSIONS.VIEW_MEMBERS,
        PERMISSIONS.VIEW_CAMPAIGNS,
        PERMISSIONS.CREATE_CONTRIBUTIONS,
        PERMISSIONS.EDIT_CONTRIBUTIONS,
        PERMISSIONS.OVERRIDE_CONTRIBUTIONS, // With emergency flag
        PERMISSIONS.VERIFY_PROOFS,
        PERMISSIONS.SUBMIT_PROOF,
        PERMISSIONS.IMPORT_EXPORT,
        PERMISSIONS.MANAGE_REMINDERS,
        PERMISSIONS.ACCESS_DANGER_ZONE,
        PERMISSIONS.VIEW_FORENSICS,
        PERMISSIONS.VIEW_VOTING_LOGS,
    ],
    MEMBER: [
        PERMISSIONS.VIEW_GROUP_SETTINGS, // Read-only
        PERMISSIONS.VIEW_MEMBERS,
        PERMISSIONS.VIEW_CAMPAIGNS,
        PERMISSIONS.SUBMIT_PROOF,
    ],
};

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: string, permission: Permission): boolean {
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role];
    return rolePermissions ? rolePermissions.includes(permission) : false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
}
