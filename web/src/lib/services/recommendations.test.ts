import { describe, it, expect } from 'vitest';
import { analyzeProject, detectProjectType, getProjectTypeLabel } from './recommendations';

describe('Recommendation Engine', () => {
  describe('analyzeProject', () => {
    it('should return empty results for empty description', () => {
      const result = analyzeProject('');
      expect(result.agents).toHaveLength(0);
      expect(result.mcps).toHaveLength(0);
      expect(result.behaviors).toHaveLength(0);
      expect(result.customSkills).toHaveLength(0);
    });

    it('should recommend payments agent and stripe MCP for marketplace', () => {
      const result = analyzeProject('I want to build a marketplace where people can buy and sell items');

      const agentIds = result.agents.map(a => a.id);
      const mcpIds = result.mcps.map(m => m.id);

      expect(agentIds).toContain('payments');
      expect(agentIds).toContain('search');
      expect(mcpIds).toContain('stripe');
      expect(mcpIds).toContain('algolia');
    });

    it('should recommend AI agent and anthropic MCP for AI apps', () => {
      const result = analyzeProject('Build a chatbot powered by AI and LLM');

      const agentIds = result.agents.map(a => a.id);
      const mcpIds = result.mcps.map(m => m.id);

      expect(agentIds).toContain('ai');
      expect(mcpIds).toContain('anthropic');
    });

    it('should flag custom skills for realtime features', () => {
      const result = analyzeProject('A real-time collaborative editor with websockets');

      const customSkillIds = result.customSkills.map(s => s.id);
      expect(customSkillIds).toContain('realtime');
    });

    it('should flag custom skills for game projects', () => {
      const result = analyzeProject('Build a multiplayer game with scores and levels');

      const customSkillIds = result.customSkills.map(s => s.id);
      expect(customSkillIds).toContain('game-engine');
    });

    it('should flag custom skills for social features', () => {
      const result = analyzeProject('Social platform where users can follow each other and share posts');

      const customSkillIds = result.customSkills.map(s => s.id);
      expect(customSkillIds).toContain('social-features');
    });

    it('should flag custom skills for media handling', () => {
      const result = analyzeProject('Users can upload images and videos to their gallery');

      const customSkillIds = result.customSkills.map(s => s.id);
      expect(customSkillIds).toContain('media-handling');
    });

    it('should flag custom skills for scheduling', () => {
      const result = analyzeProject('A booking system for appointments and calendar availability');

      const customSkillIds = result.customSkills.map(s => s.id);
      expect(customSkillIds).toContain('scheduling');
    });

    it('should include discovery answers in analysis', () => {
      const result = analyzeProject('A simple app', { platform: 'web with payments' });

      const agentIds = result.agents.map(a => a.id);
      expect(agentIds).toContain('payments');
    });

    it('should not duplicate recommendations', () => {
      const result = analyzeProject('marketplace buy sell payment checkout transaction purchase');

      // payments should only appear once even though multiple keywords match
      const paymentsCount = result.agents.filter(a => a.id === 'payments').length;
      expect(paymentsCount).toBe(1);
    });

    it('should add commit-per-task behavior for complex project types', () => {
      const result = analyzeProject('A saas subscription billing dashboard');

      const behaviorIds = result.behaviors.map(b => b.id);
      expect(behaviorIds).toContain('commit-per-task');
    });

    it('should include reason for each recommendation', () => {
      const result = analyzeProject('marketplace for selling items');

      result.agents.forEach(agent => {
        expect(agent.reason).toBeDefined();
        expect(agent.reason.length).toBeGreaterThan(0);
      });

      result.customSkills.forEach(skill => {
        expect(skill.reason).toBeDefined();
        expect(skill.reason.length).toBeGreaterThan(0);
      });
    });
  });

  describe('detectProjectType', () => {
    it('should detect marketplace type', () => {
      expect(detectProjectType('A marketplace for buying and selling items')).toBe('marketplace');
    });

    it('should detect saas type', () => {
      expect(detectProjectType('SaaS subscription dashboard with billing')).toBe('saas');
    });

    it('should detect ai-app type', () => {
      expect(detectProjectType('AI chatbot assistant')).toBe('ai-app');
    });

    it('should detect ecommerce type', () => {
      expect(detectProjectType('Online shop with cart and products')).toBe('ecommerce');
    });

    it('should detect web3 type', () => {
      expect(detectProjectType('Blockchain crypto NFT dApp')).toBe('web3');
    });

    it('should detect game type', () => {
      expect(detectProjectType('Multiplayer game with scores and levels')).toBe('game');
    });

    it('should return null for unrecognized types', () => {
      expect(detectProjectType('something completely random xyz')).toBe(null);
    });
  });

  describe('getProjectTypeLabel', () => {
    it('should return human-readable labels', () => {
      expect(getProjectTypeLabel('marketplace')).toBe('Marketplace');
      expect(getProjectTypeLabel('saas')).toBe('SaaS Application');
      expect(getProjectTypeLabel('ai-app')).toBe('AI-Powered App');
      expect(getProjectTypeLabel('ecommerce')).toBe('E-Commerce');
      expect(getProjectTypeLabel('web3')).toBe('Web3 dApp');
      expect(getProjectTypeLabel('game')).toBe('Game');
      expect(getProjectTypeLabel('tool')).toBe('Tool / Utility');
    });

    it('should return the type itself for unknown types', () => {
      expect(getProjectTypeLabel('unknown-type')).toBe('unknown-type');
    });
  });
});
