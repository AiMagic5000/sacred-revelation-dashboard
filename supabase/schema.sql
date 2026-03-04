-- Sacred Revelation Ministry Dashboard Database Schema
-- Run this in the Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZATIONS TABLE
-- Multi-tenant base table for ministry accounts
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id VARCHAR(255) NOT NULL, -- Clerk user ID
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  polar_customer_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRUST DATA TABLE
-- Ministry legal and regulatory information
-- ============================================
CREATE TABLE IF NOT EXISTS trust_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ministry_name VARCHAR(255) NOT NULL,
  ein_number VARCHAR(20),
  formation_date DATE,
  state_of_formation VARCHAR(50),
  registered_agent VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTNERS TABLE
-- Business partners and affiliated organizations
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VOLUNTEERS TABLE
-- Volunteer management and hour tracking
-- ============================================
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  skills TEXT[], -- Array of skill tags
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DONATIONS TABLE
-- Donation and payment tracking
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  donor_name VARCHAR(255) NOT NULL,
  donor_email VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(20) DEFAULT 'one-time' CHECK (type IN ('one-time', 'recurring')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method VARCHAR(50),
  receipt_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS TABLE
-- File storage and document management
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  uploaded_by VARCHAR(255) NOT NULL, -- Clerk user ID
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- Audit trail for all organization actions
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  user_id VARCHAR(255), -- Clerk user ID
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COMPLIANCE ITEMS TABLE
-- Track regulatory compliance tasks
-- ============================================
CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to VARCHAR(255),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EVENTS/SCHEDULE TABLE
-- Calendar and event management
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  event_type VARCHAR(50),
  recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCTION RECORDS TABLE
-- Track farm/food production activities
-- ============================================
CREATE TABLE IF NOT EXISTS production_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('farm', 'food')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(12,2),
  unit VARCHAR(50),
  production_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DISTRIBUTION RECORDS TABLE
-- Track resource distribution
-- ============================================
CREATE TABLE IF NOT EXISTS distribution_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_contact VARCHAR(255),
  items_distributed TEXT NOT NULL,
  quantity DECIMAL(12,2),
  distribution_date DATE NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BENEFICIARY ORGANIZATIONS TABLE
-- Track organizations that receive ministry distributions
-- ============================================
CREATE TABLE IF NOT EXISTS beneficiary_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500),
  category VARCHAR(100) CHECK (category IN (
    'Humanitarian',
    'Veterans',
    'Faith-Based',
    'Children',
    'Native Communities',
    'Anti-Trafficking',
    'Medical',
    'Education'
  )),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_distributed DECIMAL(12,2) DEFAULT 0,
  last_distribution_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HEALING SESSIONS TABLE
-- Track prayer healing and wellness sessions
-- ============================================
CREATE TABLE IF NOT EXISTS healing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  session_type VARCHAR(100) NOT NULL CHECK (session_type IN (
    'Prayer',
    'Laying on of Hands',
    'Anointing',
    'Counseling',
    'Natural Health',
    'Sound Healing',
    'Touch Healing'
  )),
  facilitator_name VARCHAR(255) NOT NULL,
  attendees_count INT DEFAULT 0 CHECK (attendees_count >= 0),
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  prayer_requests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MUSIC EVENTS TABLE
-- Track worship music and performance events
-- ============================================
CREATE TABLE IF NOT EXISTS music_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
    'Worship Service',
    'Concert',
    'Retreat',
    'Recording Session',
    'Sound Healing',
    'Music Ministry',
    'Praise Night'
  )),
  musicians TEXT[],
  songs_performed TEXT[],
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT CHECK (duration_minutes > 0),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COACHING SESSIONS TABLE
-- Track one-on-one and group coaching/mentoring
-- ============================================
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  coach_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  session_type VARCHAR(100) NOT NULL CHECK (session_type IN (
    'Training',
    'Counseling',
    'Prayer',
    'Mentoring',
    'Assessment'
  )),
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 60 CHECK (duration_minutes > 0),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ELDER BOARD RESOLUTIONS TABLE
-- Track governance decisions and board votes
-- ============================================
CREATE TABLE IF NOT EXISTS elder_board_resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  resolution_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  proposed_by VARCHAR(255),
  seconded_by VARCHAR(255),
  vote_result VARCHAR(50) CHECK (vote_result IN (
    'Unanimous',
    'Majority',
    'Tabled',
    'Withdrawn'
  )),
  resolution_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'rejected', 'tabled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Original table indexes
CREATE INDEX IF NOT EXISTS idx_trust_data_org ON trust_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_partners_org ON partners(organization_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_org ON volunteers(organization_id);
CREATE INDEX IF NOT EXISTS idx_donations_org ON donations(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_items_org ON compliance_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_org ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_production_org ON production_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_distribution_org ON distribution_records(organization_id);

-- New table indexes
CREATE INDEX IF NOT EXISTS idx_beneficiary_orgs_org ON beneficiary_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_orgs_category ON beneficiary_organizations(category);
CREATE INDEX IF NOT EXISTS idx_beneficiary_orgs_status ON beneficiary_organizations(status);

CREATE INDEX IF NOT EXISTS idx_healing_sessions_org ON healing_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_healing_sessions_date ON healing_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_healing_sessions_type ON healing_sessions(session_type);

CREATE INDEX IF NOT EXISTS idx_music_events_org ON music_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_music_events_date ON music_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_music_events_type ON music_events(event_type);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_org ON coaching_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_date ON coaching_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_status ON coaching_sessions(status);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach ON coaching_sessions(coach_name);

CREATE INDEX IF NOT EXISTS idx_elder_resolutions_org ON elder_board_resolutions(organization_id);
CREATE INDEX IF NOT EXISTS idx_elder_resolutions_date ON elder_board_resolutions(resolution_date DESC);
CREATE INDEX IF NOT EXISTS idx_elder_resolutions_status ON elder_board_resolutions(status);
CREATE INDEX IF NOT EXISTS idx_elder_resolutions_number ON elder_board_resolutions(resolution_number);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable multi-tenant data isolation
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE healing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE elder_board_resolutions ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organizations
CREATE POLICY "Users can view own organizations" ON organizations
  FOR SELECT USING (owner_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own organizations" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own organizations" ON organizations
  FOR UPDATE USING (owner_id = auth.jwt() ->> 'sub');

-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organizations
    WHERE id = org_id AND owner_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply RLS policies to child tables (using the helper function)
-- Trust Data
CREATE POLICY "Trust data isolation" ON trust_data
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Partners
CREATE POLICY "Partners isolation" ON partners
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Volunteers
CREATE POLICY "Volunteers isolation" ON volunteers
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Donations
CREATE POLICY "Donations isolation" ON donations
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Documents
CREATE POLICY "Documents isolation" ON documents
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Activity Logs
CREATE POLICY "Activity logs isolation" ON activity_logs
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Compliance Items
CREATE POLICY "Compliance items isolation" ON compliance_items
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Events
CREATE POLICY "Events isolation" ON events
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Production Records
CREATE POLICY "Production records isolation" ON production_records
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Distribution Records
CREATE POLICY "Distribution records isolation" ON distribution_records
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Beneficiary Organizations
CREATE POLICY "Beneficiary organizations isolation" ON beneficiary_organizations
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Healing Sessions
CREATE POLICY "Healing sessions isolation" ON healing_sessions
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Music Events
CREATE POLICY "Music events isolation" ON music_events
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Coaching Sessions
CREATE POLICY "Coaching sessions isolation" ON coaching_sessions
  FOR ALL USING (user_belongs_to_org(organization_id));

-- Elder Board Resolutions
CREATE POLICY "Elder board resolutions isolation" ON elder_board_resolutions
  FOR ALL USING (user_belongs_to_org(organization_id));

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to original tables
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_data_updated_at
  BEFORE UPDATE ON trust_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_items_updated_at
  BEFORE UPDATE ON compliance_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_records_updated_at
  BEFORE UPDATE ON production_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_beneficiary_orgs_updated_at
  BEFORE UPDATE ON beneficiary_organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healing_sessions_updated_at
  BEFORE UPDATE ON healing_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_events_updated_at
  BEFORE UPDATE ON music_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coaching_sessions_updated_at
  BEFORE UPDATE ON coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elder_resolutions_updated_at
  BEFORE UPDATE ON elder_board_resolutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
