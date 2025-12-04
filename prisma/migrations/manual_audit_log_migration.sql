-- Migration: Transform AuditLog structure while preserving data
-- This migration:
-- 1. Creates a backup of existing audit logs
-- 2. Adds new columns to audit_logs table
-- 3. Migrates existing data to new structure
-- 4. Removes old columns
-- 5. Creates new tables for Settings & RBAC system

-- Step 1: Create backup table
CREATE TABLE audit_logs_backup AS SELECT * FROM audit_logs;

-- Step 2: Add new columns (nullable for now)
ALTER TABLE audit_logs ADD COLUMN family_id TEXT;
ALTER TABLE audit_logs ADD COLUMN entity_type TEXT;
ALTER TABLE audit_logs ADD COLUMN entity_id TEXT;
ALTER TABLE audit_logs ADD COLUMN actor_id TEXT;
ALTER TABLE audit_logs ADD COLUMN actor_role TEXT;
ALTER TABLE audit_logs ADD COLUMN before_state JSONB;
ALTER TABLE audit_logs ADD COLUMN after_state JSONB;
ALTER TABLE audit_logs ADD COLUMN ip_address TEXT;
ALTER TABLE audit_logs ADD COLUMN device_info JSONB;
ALTER TABLE audit_logs ADD COLUMN request_id TEXT;

-- Step 3: Migrate existing data
-- Get familyId from the proof and set entity_type to 'proof'
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
  END;

-- Step 4: Make new columns NOT NULL where appropriate
ALTER TABLE audit_logs ALTER COLUMN family_id SET NOT NULL;
ALTER TABLE audit_logs ALTER COLUMN entity_type SET NOT NULL;
ALTER TABLE audit_logs ALTER COLUMN actor_id SET NOT NULL;

-- Step 5: Drop old columns
ALTER TABLE audit_logs DROP COLUMN proof_id;
ALTER TABLE audit_logs DROP COLUMN performed_by;
ALTER TABLE audit_logs DROP COLUMN previous_value;
ALTER TABLE audit_logs DROP COLUMN new_value;

-- Step 6: Create indexes for new structure
CREATE INDEX idx_audit_logs_family_id ON audit_logs(family_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);

-- Step 7: Add foreign key constraints
ALTER TABLE audit_logs 
  ADD CONSTRAINT fk_audit_logs_family 
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE;

ALTER TABLE audit_logs 
  ADD CONSTRAINT fk_audit_logs_actor 
  FOREIGN KEY (actor_id) REFERENCES users(id);

-- Step 8: Create new tables for Settings & RBAC system

-- FamilySettings table
CREATE TABLE family_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  family_id TEXT UNIQUE NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  settings JSONB NOT NULL,
  version_history JSONB DEFAULT '[]'::jsonb NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_family_settings_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  CONSTRAINT fk_family_settings_updater FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- RolePermission table
CREATE TABLE role_permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  role TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT unique_role_permission UNIQUE (role, permission_key)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role);

-- DangerAction table
CREATE TABLE danger_actions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  family_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  requested_by TEXT NOT NULL,
  requested_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  required_approvals JSONB NOT NULL,
  approvals JSONB DEFAULT '[]'::jsonb NOT NULL,
  status TEXT DEFAULT 'PENDING' NOT NULL,
  reason TEXT,
  cooling_ends_at TIMESTAMP(3),
  executed_by TEXT,
  executed_at TIMESTAMP(3),
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_danger_actions_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  CONSTRAINT fk_danger_actions_requester FOREIGN KEY (requested_by) REFERENCES users(id),
  CONSTRAINT fk_danger_actions_executor FOREIGN KEY (executed_by) REFERENCES users(id)
);

CREATE INDEX idx_danger_actions_family_id ON danger_actions(family_id);
CREATE INDEX idx_danger_actions_status ON danger_actions(status);

-- NotificationQueue table
CREATE TABLE notification_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  family_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  priority TEXT DEFAULT 'NORMAL' NOT NULL,
  channels JSONB DEFAULT '[]'::jsonb NOT NULL,
  sent_at TIMESTAMP(3),
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMP(3),
  metadata JSONB,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_notification_queue_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_queue_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_queue_user_read ON notification_queue(user_id, is_read);
CREATE INDEX idx_notification_queue_family_id ON notification_queue(family_id);

-- Verification: Check migration success
SELECT 
  'Audit logs migrated' as status,
  COUNT(*) as total_records,
  COUNT(DISTINCT family_id) as families_affected,
  COUNT(DISTINCT entity_type) as entity_types
FROM audit_logs;
