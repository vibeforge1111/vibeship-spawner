-- Workflow State Persistence
-- Stores workflow and team state for resume capability

CREATE TABLE IF NOT EXISTS workflow_state (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL,
  state_data TEXT, -- JSON blob
  history TEXT, -- JSON array of step results
  started_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT,
  user_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_workflow_state_status ON workflow_state(status);
CREATE INDEX IF NOT EXISTS idx_workflow_state_user ON workflow_state(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_state_updated ON workflow_state(updated_at DESC);

-- Team state for active teams
CREATE TABLE IF NOT EXISTS team_state (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  current_lead TEXT NOT NULL,
  members TEXT NOT NULL, -- JSON array
  state_data TEXT, -- JSON blob
  communication_log TEXT, -- JSON array
  started_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  user_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_team_state_team ON team_state(team_id);
CREATE INDEX IF NOT EXISTS idx_team_state_user ON team_state(user_id);
