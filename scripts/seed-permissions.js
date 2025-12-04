/**
 * Seed Script: Role Permissions (CommonJS version)
 * 
 * Seeds the role_permissions table with default permissions for each role.
 * Run this after the initial migration to set up the permission system.
 * 
 * Usage: node scripts/seed-permissions.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PERMISSIONS = {
    // View permissions
    VIEW_GROUP_SETTINGS: 'viewGroupSettings',
    VIEW_FORENSICS: 'viewForensics',
    VIEW_VOTING_LOGS: 'viewVotingLogs',

    // Edit permissions
    EDIT_GROUP_IDENTITY: 'editGroupIdentity',
    MANAGE_ROLES: 'manageRoles',

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
};

const DEFAULT_ROLE_PERMISSIONS = {
    PRESIDENT: [
        PERMISSIONS.VIEW_GROUP_SETTINGS,
        PERMISSIONS.EDIT_GROUP_IDENTITY,
        PERMISSIONS.MANAGE_ROLES,
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
        PERMISSIONS.CREATE_CONTRIBUTIONS,
        PERMISSIONS.EDIT_CONTRIBUTIONS,
        PERMISSIONS.OVERRIDE_CONTRIBUTIONS,
        PERMISSIONS.VERIFY_PROOFS,
        PERMISSIONS.SUBMIT_PROOF,
        PERMISSIONS.IMPORT_EXPORT,
        PERMISSIONS.MANAGE_REMINDERS,
        PERMISSIONS.ACCESS_DANGER_ZONE,
        PERMISSIONS.VIEW_FORENSICS,
        PERMISSIONS.VIEW_VOTING_LOGS,
    ],
    MEMBER: [
        PERMISSIONS.VIEW_GROUP_SETTINGS,
        PERMISSIONS.SUBMIT_PROOF,
    ],
};

async function seedRolePermissions() {
    console.log('🌱 Seeding role permissions...\n');

    try {
        let totalSeeded = 0;

        for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
            console.log(`📝 Seeding permissions for role: ${role}`);

            for (const permission of permissions) {
                await prisma.rolePermission.upsert({
                    where: {
                        role_permissionKey: {
                            role,
                            permissionKey: permission,
                        },
                    },
                    update: {
                        enabled: true,
                    },
                    create: {
                        role,
                        permissionKey: permission,
                        enabled: true,
                    },
                });
                totalSeeded++;
            }

            console.log(`   ✅ ${permissions.length} permissions seeded for ${role}`);
        }

        console.log(`\n🎉 Successfully seeded ${totalSeeded} role permissions!\n`);
        console.log('📊 Summary:');
        console.log(`   - PRESIDENT: ${DEFAULT_ROLE_PERMISSIONS.PRESIDENT.length} permissions`);
        console.log(`   - TREASURER: ${DEFAULT_ROLE_PERMISSIONS.TREASURER.length} permissions`);
        console.log(`   - MEMBER: ${DEFAULT_ROLE_PERMISSIONS.MEMBER.length} permissions\n`);

    } catch (error) {
        console.error('❌ Error seeding permissions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed
seedRolePermissions()
    .then(() => {
        console.log('✨ Seed completed successfully!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    });
