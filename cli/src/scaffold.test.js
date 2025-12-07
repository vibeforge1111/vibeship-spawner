import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { scaffoldProject } from './scaffold.js';

describe('Scaffold', () => {
  let tempDir;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vibeship-test-'));
  });

  after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should create project directory structure', async () => {
    const config = {
      project_name: 'test-project',
      description: 'A test project',
      agents: ['planner', 'frontend'],
      mcps: ['filesystem'],
      behaviors: { mandatory: [], selected: [] },
      custom_skills_needed: []
    };

    const projectDir = path.join(tempDir, 'test-project');
    await scaffoldProject(config, projectDir);

    // Check directories exist
    const docsExists = await fs.stat(path.join(projectDir, 'docs')).then(() => true).catch(() => false);
    const skillsExists = await fs.stat(path.join(projectDir, 'skills')).then(() => true).catch(() => false);
    const claudeExists = await fs.stat(path.join(projectDir, '.claude')).then(() => true).catch(() => false);

    assert.strictEqual(docsExists, true, 'docs directory should exist');
    assert.strictEqual(skillsExists, true, 'skills directory should exist');
    assert.strictEqual(claudeExists, true, '.claude directory should exist');
  });

  test('should write state.json with custom_skills_needed', async () => {
    const config = {
      project_name: 'custom-skills-project',
      description: 'A project with custom skills',
      agents: ['planner', 'frontend'],
      mcps: ['filesystem'],
      behaviors: { mandatory: [], selected: [] },
      custom_skills_needed: ['realtime', 'game-engine', 'scheduling']
    };

    const projectDir = path.join(tempDir, 'custom-skills-project');
    await scaffoldProject(config, projectDir);

    // Read and parse state.json
    const stateContent = await fs.readFile(path.join(projectDir, 'state.json'), 'utf-8');
    const state = JSON.parse(stateContent);

    assert.ok(Array.isArray(state.custom_skills_needed), 'custom_skills_needed should be an array');
    assert.strictEqual(state.custom_skills_needed.length, 3, 'should have 3 custom skills');
    assert.ok(state.custom_skills_needed.includes('realtime'), 'should include realtime');
    assert.ok(state.custom_skills_needed.includes('game-engine'), 'should include game-engine');
    assert.ok(state.custom_skills_needed.includes('scheduling'), 'should include scheduling');
  });

  test('should handle empty custom_skills_needed', async () => {
    const config = {
      project_name: 'no-custom-skills',
      description: 'A project without custom skills',
      agents: ['planner'],
      mcps: ['filesystem'],
      behaviors: { mandatory: [], selected: [] },
      custom_skills_needed: []
    };

    const projectDir = path.join(tempDir, 'no-custom-skills');
    await scaffoldProject(config, projectDir);

    const stateContent = await fs.readFile(path.join(projectDir, 'state.json'), 'utf-8');
    const state = JSON.parse(stateContent);

    assert.ok(Array.isArray(state.custom_skills_needed), 'custom_skills_needed should be an array');
    assert.strictEqual(state.custom_skills_needed.length, 0, 'should have 0 custom skills');
  });

  test('should handle missing custom_skills_needed in config', async () => {
    const config = {
      project_name: 'missing-field',
      description: 'A project with missing field',
      agents: ['planner'],
      mcps: ['filesystem'],
      behaviors: { mandatory: [], selected: [] }
      // custom_skills_needed is intentionally missing
    };

    const projectDir = path.join(tempDir, 'missing-field');
    await scaffoldProject(config, projectDir);

    const stateContent = await fs.readFile(path.join(projectDir, 'state.json'), 'utf-8');
    const state = JSON.parse(stateContent);

    // Should default to empty array
    assert.ok(Array.isArray(state.custom_skills_needed), 'custom_skills_needed should default to array');
    assert.strictEqual(state.custom_skills_needed.length, 0, 'should default to empty array');
  });

  test('should copy skill files for selected agents', async () => {
    const config = {
      project_name: 'with-skills',
      description: 'A project with skills',
      agents: ['planner', 'frontend', 'backend'],
      mcps: ['filesystem'],
      behaviors: { mandatory: [], selected: [] },
      custom_skills_needed: []
    };

    const projectDir = path.join(tempDir, 'with-skills');
    await scaffoldProject(config, projectDir);

    // Check that skill files exist (or placeholders)
    const plannerExists = await fs.stat(path.join(projectDir, 'skills', 'planner.md')).then(() => true).catch(() => false);
    const frontendExists = await fs.stat(path.join(projectDir, 'skills', 'frontend.md')).then(() => true).catch(() => false);
    const backendExists = await fs.stat(path.join(projectDir, 'skills', 'backend.md')).then(() => true).catch(() => false);

    assert.strictEqual(plannerExists, true, 'planner.md should exist');
    assert.strictEqual(frontendExists, true, 'frontend.md should exist');
    assert.strictEqual(backendExists, true, 'backend.md should exist');
  });

  test('should write CLAUDE.md with project info', async () => {
    const config = {
      project_name: 'claude-md-test',
      description: 'Testing CLAUDE.md generation',
      agents: ['planner', 'frontend'],
      mcps: ['filesystem', 'supabase'],
      behaviors: { mandatory: ['verify-before-complete'], selected: ['tdd-mode'] },
      custom_skills_needed: ['realtime']
    };

    const projectDir = path.join(tempDir, 'claude-md-test');
    await scaffoldProject(config, projectDir);

    const claudeContent = await fs.readFile(path.join(projectDir, 'CLAUDE.md'), 'utf-8');

    // Should contain project name
    assert.ok(claudeContent.includes('claude-md-test'), 'should include project name');
    // Should contain session start instructions
    assert.ok(claudeContent.includes('custom_skills_needed') || claudeContent.includes('On Session Start'), 'should include startup instructions');
  });

  test('should set initial phase to planning', async () => {
    const config = {
      project_name: 'phase-test',
      description: 'Testing initial phase',
      agents: ['planner'],
      mcps: ['filesystem'],
      behaviors: { mandatory: [], selected: [] },
      custom_skills_needed: []
    };

    const projectDir = path.join(tempDir, 'phase-test');
    await scaffoldProject(config, projectDir);

    const stateContent = await fs.readFile(path.join(projectDir, 'state.json'), 'utf-8');
    const state = JSON.parse(stateContent);

    assert.strictEqual(state.phase, 'planning', 'initial phase should be planning');
  });
});
