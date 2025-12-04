/**
 * Seed Script: Role Permissions
 * 
 * Seeds the role_permissions table with default permissions for each role.
 * Run this after the initial migration to set up the permission system.
 * 
 * Usage: npx tsx scripts/seed-permissions.ts
 */

import { PrismaClient } from '@prisma/client';
import { DEFAULT_ROLE_PERMISSIONS } from '../lib/permissions';

const prisma = new PrismaClient();

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
