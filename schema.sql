-- Users table (synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Families (Groups) table
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- Invite code
  created_by UUID REFERENCES users(id),
  base_share_value DECIMAL(10, 2) DEFAULT 100.00,
  on_time_bonus_percent DECIMAL(5, 2) DEFAULT 2.00,
  streak_bonus_percent DECIMAL(5, 2) DEFAULT 5.00,
  contribution_deadline_day INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Members (Many-to-Many)
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER', -- 'PRESIDENT', 'TREASURER', 'SECRETARY', 'MEMBER', 'SPOUSE'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'ACTIVE',
  UNIQUE(family_id, user_id)
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  shares DECIMAL(10, 2) NOT NULL,
  contribution_month DATE NOT NULL, -- First day of the month
  paid_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'PENDING', -- 'PAID', 'PENDING', 'OVERDUE'
  notes TEXT,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_contributions_family_id ON contributions(family_id);
