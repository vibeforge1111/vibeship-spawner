-- Spawner V2 Database Schema
-- Migration: 002_add_project_path
-- Created: 2024-12-19
-- Purpose: Add path column for orchestration layer to find projects by directory

-- Add path column to projects table
ALTER TABLE projects ADD COLUMN path TEXT;

-- Create index for path lookups
CREATE INDEX IF NOT EXISTS idx_projects_path ON projects(path);
