/**
 * Data Migration Script: Audit Log Transformation
 * 
 * This script migrates existing audit logs from the old structure to the new generic structure
 * while preserving all existing data.
 * 
 * Run this BEFORE running `npx prisma db push`
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAuditLogs() {
    console.log('🔄 Starting audit log migration...\n');

    try {
        // Step 1: Get all existing audit logs
        const existingLogs = await prisma.$queryRaw<any[]>`
      SELECT * FROM audit_logs
    `;

        console.log(`📊 Found ${existingLogs.length} existing audit logs to migrate\n`);

        if (existingLogs.length === 0) {
            console.log('✅ No audit logs to migrate. Safe to proceed with schema update.\n');
            return;
        }

        // Step 2: Create backup
        console.log('💾 Creating backup...');
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS audit_logs_backup AS SELECT * FROM audit_logs
    `;
        console.log('✅ Backup created\n');

        // Step 3: Add new columns
        console.log('🔧 Adding new columns...');
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS family_id TEXT`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id TEXT`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_id TEXT`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_role TEXT`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS before_state JSONB`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS after_state JSONB`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS device_info JSONB`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_id TEXT`;
        console.log('✅ New columns added\n');

        // Step 4: Migrate data
        console.log('📦 Migrating data...');
        await prisma.$executeRaw`
      UPDATE audit_logs al
      SET 
        family_id = (SELECT family_id FROM proofs_of_payment WHERE id = al.proof_id),
        entity_type = 'proof',
        entity_id = al.proof_id,
        actor_id = al.performed_by,
        before_state = CASE 
          WHEN al.previous_value IS NOT NULL THEN al.previous_value::jsonb 
          ELSE NULL 
        END,
        after_state = CASE 
          WHEN al.new_value IS NOT NULL THEN al.new_value::jsonb 
          ELSE NULL 
        END
    `;
        console.log('✅ Data migrated\n');

        // Step 5: Verify migration
        const migratedCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM audit_logs WHERE family_id IS NOT NULL
    `;
        console.log(`✅ Verified: ${migratedCount[0].count} records migrated successfully\n`);

        // Step 6: Make columns NOT NULL
        console.log('🔒 Setting constraints...');
        await prisma.$executeRaw`ALTER TABLE audit_logs ALTER COLUMN family_id SET NOT NULL`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ALTER COLUMN entity_type SET NOT NULL`;
        await prisma.$executeRaw`ALTER TABLE audit_logs ALTER COLUMN actor_id SET NOT NULL`;
        console.log('✅ Constraints set\n');

        // Step 7: Drop old columns
        console.log('🗑️  Removing old columns...');
        await prisma.$executeRaw`ALTER TABLE audit_logs DROP COLUMN IF EXISTS proof_id`;
        await prisma.$executeRaw`ALTER TABLE audit_logs DROP COLUMN IF EXISTS performed_by`;
        await prisma.$executeRaw`ALTER TABLE audit_logs DROP COLUMN IF EXISTS previous_value`;
        await prisma.$executeRaw`ALTER TABLE audit_logs DROP COLUMN IF EXISTS new_value`;
        console.log('✅ Old columns removed\n');

        console.log('🎉 Migration completed successfully!\n');
        console.log('📝 Summary:');
        console.log(`   - Migrated: ${existingLogs.length} audit logs`);
        console.log(`   - Backup table: audit_logs_backup`);
        console.log(`   - Ready for: npx prisma db push\n`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.log('\n⚠️  Rolling back...');

        try {
            // Attempt to restore from backup if it exists
            await prisma.$executeRaw`
        DROP TABLE IF EXISTS audit_logs;
        ALTER TABLE audit_logs_backup RENAME TO audit_logs;
      `;
            console.log('✅ Rollback successful\n');
        } catch (rollbackError) {
            console.error('❌ Rollback failed:', rollbackError);
            console.log('\n⚠️  Manual intervention required. Check audit_logs_backup table.\n');
        }

        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateAuditLogs()
    .then(() => {
        console.log('✨ You can now run: npx prisma db push\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
