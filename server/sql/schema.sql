-- ============================================
-- BUG TRACKER DATABASE SCHEMA
-- PostgreSQL with UUID primary keys
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user queries
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- ============================================
-- PROJECT MEMBERS (Many-to-Many)
-- ============================================
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'developer' CHECK (role IN ('admin', 'manager', 'developer', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- ============================================
-- TICKETS TABLE
-- ============================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  type VARCHAR(20) DEFAULT 'bug' CHECK (type IN ('bug', 'feature', 'task', 'improvement')),
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES users(id),
  due_date DATE,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_project_id ON tickets(project_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assignee_id ON tickets(assignee_id);
CREATE INDEX idx_tickets_reporter_id ON tickets(reporter_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);

-- ============================================
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('created', 'updated', 'deleted', 'status_changed', 'commented')),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('ticket', 'comment', 'member', 'project')),
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- ============================================
-- TRIGGER TO UPDATE updated_at COLUMN
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_ticket_timestamp
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- END OF SCHEMA
-- ============================================
