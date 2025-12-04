/**
 * Permission Checking Utilities
 * 
 * Provides functions to check if a user has specific permissions
 * based on their role in a family.
 */

import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Permission } from './index';

/**
 * Check if a user has a specific permission in a family
 * 
 * @param userId - Database user ID
 * @param familyId - Family ID
 * @param permission - Permission to check
 * @returns true if user has the permission, false otherwise
 */
export async function hasPermission(
    userId: string,
    familyId: string,
    permission: Permission
): Promise<boolean> {
    try {
        // Get user's role in family
        const member = await prisma.familyMember.findUnique({
            where: {
                familyId_userId: { familyId, userId },
            },
            select: { role: true, status: true },
        });

        if (!member || member.status !== 'ACTIVE') {
            return false;
        }

        // Check permission matrix
        const rolePermission = await prisma.rolePermission.findUnique({
            where: {
                role_permissionKey: {
                    role: member.role,
                    permissionKey: permission,
                },
            },
        });

        return rolePermission?.enabled ?? false;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}

/**
 * Require a specific permission or throw an error
 * 
 * This is useful for server actions that need to enforce permissions.
 * 
 * @param familyId - Family ID
 * @param permission - Required permission
 * @returns Object with userId and role
 * @throws Error if user doesn't have permission
 */
export async function requirePermission(
    familyId: string,
    permission: Permission
): Promise<{ userId: string; role: string }> {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
        throw new Error('Unauthorized: Not logged in');
    }

    // Get database user
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    });

    if (!dbUser) {
        throw new Error('User not found in database');
    }

    // Check permission
    const allowed = await hasPermission(dbUser.id, familyId, permission);
    if (!allowed) {
        throw new Error(`Permission denied: ${permission}`);
    }

    // Get user's role
    const member = await prisma.familyMember.findUnique({
        where: {
            familyId_userId: { familyId, userId: dbUser.id },
        },
        select: { role: true },
    });

    if (!member) {
        throw new Error('Not a member of this family');
    }

    return { userId: dbUser.id, role: member.role };
}

/**
 * Get all permissions for a user in a family
 * 
 * @param userId - Database user ID
 * @param familyId - Family ID
 * @returns Array of permission keys
 */
export async function getUserPermissions(
    userId: string,
    familyId: string
): Promise<Permission[]> {
    try {
        // Get user's role
        const member = await prisma.familyMember.findUnique({
            where: {
                familyId_userId: { familyId, userId },
            },
            select: { role: true, status: true },
        });

        if (!member || member.status !== 'ACTIVE') {
            return [];
        }

        // Get all permissions for this role
        const rolePermissions = await prisma.rolePermission.findMany({
            where: {
                role: member.role,
                enabled: true,
            },
            select: { permissionKey: true },
        });

        return rolePermissions.map(rp => rp.permissionKey as Permission);
    } catch (error) {
        console.error('Error getting user permissions:', error);
        return [];
    }
}

/**
 * Check if current authenticated user has permission
 * 
 * Convenience function that gets the current user from Clerk auth
 * 
 * @param familyId - Family ID
 * @param permission - Permission to check
 * @returns true if user has permission, false otherwise
 */
export async function currentUserHasPermission(
    familyId: string,
    permission: Permission
): Promise<boolean> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) return false;

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });

        if (!dbUser) return false;

        return hasPermission(dbUser.id, familyId, permission);
    } catch (error) {
        console.error('Error checking current user permission:', error);
        return false;
    }
}
