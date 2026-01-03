-- Spawner V2 Database Schema
-- Migration: 004_missions
-- Created: 2025-01-04
-- Purpose: Mission orchestration for multi-agent workflows

-- Missions table - stores mission definitions and state
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Execution configuration
  mode TEXT NOT NULL DEFAULT 'claude-code',  -- claude-code | api | sdk
  status TEXT NOT NULL DEFAULT 'draft',      -- draft | ready | running | paused | completed | failed

  -- The mission data (JSON)
  agents TEXT NOT NULL DEFAULT '[]',         -- JSON array of MissionAgent
  tasks TEXT NOT NULL DEFAULT '[]',          -- JSON array of MissionTask
  context TEXT NOT NULL DEFAULT '{}',        -- JSON object MissionContext

  -- Execution state
  current_task_id TEXT,
  outputs TEXT DEFAULT '{}',                 -- JSON object of outputs
  error TEXT,

  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  started_at TEXT,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_missions_user ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_updated ON missions(updated_at);

-- Mission logs - execution history
CREATE TABLE IF NOT EXISTS mission_logs (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  agent_id TEXT,
  task_id TEXT,

  -- Log entry
  type TEXT NOT NULL,           -- start | progress | handoff | complete | error
  message TEXT NOT NULL,
  data TEXT DEFAULT '{}',       -- JSON object with additional data

  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mission_logs_mission ON mission_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_type ON mission_logs(type);
CREATE INDEX IF NOT EXISTS idx_mission_logs_date ON mission_logs(created_at);

-- Mission templates - reusable mission configurations
CREATE TABLE IF NOT EXISTS mission_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  -- Template data (JSON)
  agents TEXT NOT NULL DEFAULT '[]',
  tasks TEXT NOT NULL DEFAULT '[]',
  suggested_for TEXT DEFAULT '[]',   -- JSON array of project types

  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mission_templates_category ON mission_templates(category);
