'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getOrCreateUser() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const email = user.emailAddresses[0]?.emailAddress;

    // Check if user exists
    const existingUser = await sql`SELECT id FROM users WHERE clerk_id = ${userId}`;
    if (existingUser.length > 0) {
        return existingUser[0].id;
    }

    // Create user
    const newUser = await sql`
        INSERT INTO users (clerk_id, email, full_name, avatar_url)
        VALUES (${userId}, ${email}, ${user.fullName}, ${user.imageUrl})
        RETURNING id
    `;
    return newUser[0].id;
}

export async function createFamily(formData: FormData) {
    const name = formData.get("name") as string;
    if (!name) throw new Error("Family name is required");

    const userId = await getOrCreateUser();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
        // Start transaction-like logic (Neon supports simple queries, for safety we do sequential)
        // 1. Create Family
        const family = await sql`
            INSERT INTO families (name, code, created_by)
            VALUES (${name}, ${code}, ${userId})
            RETURNING id
        `;
        const familyId = family[0].id;

        // 2. Add Creator as President
        await sql`
            INSERT INTO family_members (family_id, user_id, role, status)
            VALUES (${familyId}, ${userId}, 'PRESIDENT', 'ACTIVE')
        `;

        return { success: true, familyId };
    } catch (error) {
        console.error("Failed to create family:", error);
        return { error: "Failed to create family" };
    }
}

export async function joinFamily(formData: FormData) {
    const code = formData.get("code") as string;
    if (!code) throw new Error("Invite code is required");

    const userId = await getOrCreateUser();

    try {
        // Find family
        const family = await sql`SELECT id FROM families WHERE code = ${code}`;
        if (family.length === 0) {
            return { error: "Invalid invite code" };
        }
        const familyId = family[0].id;

        // Check if already member
        const existingMember = await sql`
            SELECT id FROM family_members 
            WHERE family_id = ${familyId} AND user_id = ${userId}
        `;
        if (existingMember.length > 0) {
            return { error: "Already a member of this family" };
        }

        // Add as Member
        await sql`
            INSERT INTO family_members (family_id, user_id, role, status)
            VALUES (${familyId}, ${userId}, 'MEMBER', 'ACTIVE')
        `;

        return { success: true, familyId };
    } catch (error) {
        console.error("Failed to join family:", error);
        return { error: "Failed to join family" };
    }
}

export async function getUserFamily() {
    const userId = await getOrCreateUser();

    // Get user's family membership
    const membership = await sql`
        SELECT family_id, role, status 
        FROM family_members 
        WHERE user_id = ${userId} AND status = 'ACTIVE'
    `;

    if (membership.length === 0) {
        return null;
    }

    const familyId = membership[0].family_id;

    // Get Family Details
    const family = await sql`
        SELECT * FROM families WHERE id = ${familyId}
    `;

    // Get Member Count
    const members = await sql`
        SELECT count(*) as count FROM family_members WHERE family_id = ${familyId} AND status = 'ACTIVE'
    `;

    // Get Current Month's Contribution for this user
    // (Assuming contribution_month is stored as YYYY-MM-01)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const contribution = await sql`
        SELECT status, amount 
        FROM contributions 
        WHERE family_id = ${familyId} 
        AND user_id = ${userId} 
        AND contribution_month = ${startOfMonth}
    `;

    return {
        family: family[0],
        role: membership[0].role,
        memberCount: members[0].count,
        contributionStatus: contribution.length > 0 ? contribution[0].status : 'PENDING',
        contributionAmount: contribution.length > 0 ? contribution[0].amount : 0
    };
}
