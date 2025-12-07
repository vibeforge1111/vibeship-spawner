import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  selectedAgents,
  selectedMcps,
  addAgent,
  removeAgent,
  addMcp,
  removeMcp,
  applyTemplate,
  selectedTemplate,
  updateRecommendations,
  detectedProjectType,
  customSkillsNeeded,
  applyAllRecommendations,
  resetStack,
  projectName,
  projectDescription
} from './stack';

describe('Stack Store - Agent Management', () => {
  beforeEach(() => {
    resetStack();
  });

  it('should start with planner agent', () => {
    const agents = get(selectedAgents);
    expect(agents).toEqual(['planner']);
  });

  it('should add agent to selection', () => {
    addAgent('frontend');
    const agents = get(selectedAgents);
    expect(agents).toContain('frontend');
    expect(agents).toContain('planner');
  });

  it('should not duplicate agents', () => {
    addAgent('frontend');
    addAgent('frontend');
    const agents = get(selectedAgents);
    const frontendCount = agents.filter(id => id === 'frontend').length;
    expect(frontendCount).toBe(1);
  });

  it('should auto-add required MCPs when adding agent (devops requires git)', () => {
    addAgent('devops');
    const mcps = get(selectedMcps);
    expect(mcps).toContain('filesystem');
    expect(mcps).toContain('git');
  });

  it('should not remove planner (alwaysIncluded)', () => {
    removeAgent('planner');
    const agents = get(selectedAgents);
    expect(agents).toContain('planner');
  });

  it('should remove non-required agents', () => {
    addAgent('frontend');
    removeAgent('frontend');
    const agents = get(selectedAgents);
    expect(agents).not.toContain('frontend');
    expect(agents).toContain('planner');
  });
});

describe('Stack Store - MCP Management', () => {
  beforeEach(() => {
    resetStack();
  });

  it('should start with filesystem MCP', () => {
    const mcps = get(selectedMcps);
    expect(mcps).toEqual(['filesystem']);
  });

  it('should add MCP to selection', () => {
    addMcp('git');
    const mcps = get(selectedMcps);
    expect(mcps).toContain('git');
    expect(mcps).toContain('filesystem');
  });

  it('should not duplicate MCPs', () => {
    addMcp('git');
    addMcp('git');
    const mcps = get(selectedMcps);
    const gitCount = mcps.filter(id => id === 'git').length;
    expect(gitCount).toBe(1);
  });

  it('should not remove core MCP (filesystem)', () => {
    removeMcp('filesystem');
    const mcps = get(selectedMcps);
    expect(mcps).toContain('filesystem');
  });

  it('should remove non-core MCPs', () => {
    addMcp('git');
    removeMcp('git');
    const mcps = get(selectedMcps);
    expect(mcps).not.toContain('git');
    expect(mcps).toContain('filesystem');
  });
});

describe('Stack Store - Templates', () => {
  beforeEach(() => {
    resetStack();
  });

  it('should apply marketplace template (has payments, search, stripe, algolia)', () => {
    applyTemplate('marketplace');
    const agents = get(selectedAgents);
    const mcps = get(selectedMcps);

    expect(agents).toContain('payments');
    expect(agents).toContain('search');
    expect(mcps).toContain('stripe');
    expect(mcps).toContain('algolia');
  });

  it('should apply ai-app template (has ai agent, anthropic MCP)', () => {
    applyTemplate('ai-app');
    const agents = get(selectedAgents);
    const mcps = get(selectedMcps);

    expect(agents).toContain('ai');
    expect(mcps).toContain('anthropic');
  });

  it('should update selectedTemplate store', () => {
    applyTemplate('marketplace');
    const template = get(selectedTemplate);
    expect(template).toBe('marketplace');
  });

  it('should do nothing for invalid template', () => {
    const initialAgents = get(selectedAgents);
    const initialMcps = get(selectedMcps);
    const initialTemplate = get(selectedTemplate);

    applyTemplate('nonexistent-template');

    expect(get(selectedAgents)).toEqual(initialAgents);
    expect(get(selectedMcps)).toEqual(initialMcps);
    expect(get(selectedTemplate)).toBe(initialTemplate);
  });
});

describe('Stack Store - Recommendations', () => {
  beforeEach(() => {
    resetStack();
  });

  it('should update recommendations from project description', () => {
    const result = updateRecommendations('A marketplace for buying and selling items');

    expect(result).toBeDefined();
    expect(result.agents).toBeDefined();
    expect(result.mcps).toBeDefined();
    expect(result.behaviors).toBeDefined();
    expect(result.customSkills).toBeDefined();
  });

  it('should detect project type', () => {
    updateRecommendations('A marketplace for buying and selling items');
    const projectType = get(detectedProjectType);
    expect(projectType).toBe('marketplace');
  });

  it('should populate customSkillsNeeded for realtime features', () => {
    updateRecommendations('A real-time collaborative editor with websockets');
    const skills = get(customSkillsNeeded);
    expect(skills).toContain('realtime');
  });

  it('should apply all recommendations', () => {
    const result = updateRecommendations('A marketplace for buying and selling items');
    applyAllRecommendations(result);

    const agents = get(selectedAgents);
    const mcps = get(selectedMcps);

    // Check that recommended agents were added
    result.agents.forEach(rec => {
      expect(agents).toContain(rec.id);
    });

    // Check that recommended MCPs were added
    result.mcps.forEach(rec => {
      expect(mcps).toContain(rec.id);
    });
  });
});

describe('Stack Store - Reset', () => {
  it('should reset all stores to defaults', () => {
    // Make changes to various stores
    projectName.set('Test Project');
    projectDescription.set('Test Description');
    addAgent('frontend');
    addAgent('backend');
    addMcp('git');
    applyTemplate('marketplace');

    // Reset
    resetStack();

    // Verify all stores are back to defaults
    expect(get(projectName)).toBe('');
    expect(get(projectDescription)).toBe('');
    expect(get(selectedAgents)).toEqual(['planner']);
    expect(get(selectedMcps)).toEqual(['filesystem']);
    expect(get(selectedTemplate)).toBe(null);
    expect(get(customSkillsNeeded)).toEqual([]);
    expect(get(detectedProjectType)).toBe(null);
  });
});
