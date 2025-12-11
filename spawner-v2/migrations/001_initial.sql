-- Spawner V2 Database Schema
-- Migration: 001_initial
-- Created: 2024-12-11

-- Projects table - stores project context across sessions
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  stack TEXT NOT NULL DEFAULT '[]',  -- JSON array of stack identifiers
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at);

-- Architecture Decisions - tracks important decisions made during development
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  reasoning TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id);

-- Session Summaries - captures what happened in each session
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  issues_open TEXT DEFAULT '[]',     -- JSON array of issue IDs
  issues_resolved TEXT DEFAULT '[]', -- JSON array of issue IDs
  validations_passed TEXT DEFAULT '[]', -- JSON array of check IDs
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(created_at);

-- Known Issues - tracks problems encountered and their resolution
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',  -- open | resolved
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);

-- Telemetry Events - anonymized usage data for improving the system
CREATE TABLE IF NOT EXISTS telemetry (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  project_id TEXT,
  skill_id TEXT,
  metadata TEXT DEFAULT '{}',  -- JSON object
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_telemetry_type ON telemetry(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_date ON telemetry(created_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_skill ON telemetry(skill_id);
