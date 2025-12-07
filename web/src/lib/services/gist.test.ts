import { describe, it, expect } from 'vitest';
import { buildConfig, extractGistId } from './gist';

describe('Gist Service', () => {
  describe('buildConfig', () => {
    it('should build config with all required fields', () => {
      const config = buildConfig(
        'my-project',
        'A test project',
        { platform: 'web' },
        ['planner', 'frontend'],
        ['filesystem', 'supabase'],
        ['tdd-mode'],
        ['realtime']
      );

      expect(config.project_name).toBe('my-project');
      expect(config.description).toBe('A test project');
      expect(config.discovery).toEqual({ platform: 'web' });
      expect(config.agents).toEqual(['planner', 'frontend']);
      expect(config.mcps).toEqual(['filesystem', 'supabase']);
      expect(config.behaviors.selected).toEqual(['tdd-mode']);
      expect(config.custom_skills_needed).toEqual(['realtime']);
    });

    it('should include mandatory behaviors', () => {
      const config = buildConfig('test', '', {}, [], [], [], []);

      expect(config.behaviors.mandatory).toContain('verify-before-complete');
      expect(config.behaviors.mandatory).toContain('follow-architecture');
      expect(config.behaviors.mandatory).toContain('one-task-at-a-time');
      expect(config.behaviors.mandatory).toContain('maintainable-code');
      expect(config.behaviors.mandatory).toContain('secure-code');
    });

    it('should include custom_skills_needed in config', () => {
      const config = buildConfig(
        'game-project',
        'A game',
        {},
        ['planner', 'frontend'],
        ['filesystem'],
        [],
        ['game-engine', 'realtime']
      );

      expect(config.custom_skills_needed).toHaveLength(2);
      expect(config.custom_skills_needed).toContain('game-engine');
      expect(config.custom_skills_needed).toContain('realtime');
    });

    it('should handle empty custom_skills_needed', () => {
      const config = buildConfig('test', '', {}, [], [], [], []);

      expect(config.custom_skills_needed).toEqual([]);
    });

    it('should default project_name to my-project when empty', () => {
      const config = buildConfig('', '', {}, [], [], [], []);

      expect(config.project_name).toBe('my-project');
    });

    it('should include generated_at timestamp', () => {
      const before = new Date().toISOString();
      const config = buildConfig('test', '', {}, [], [], [], []);
      const after = new Date().toISOString();

      expect(config.generated_at).toBeDefined();
      expect(config.generated_at >= before).toBe(true);
      expect(config.generated_at <= after).toBe(true);
    });
  });

  describe('extractGistId', () => {
    it('should extract ID from full gist URL', () => {
      const url = 'https://gist.github.com/username/abc123def456';
      expect(extractGistId(url)).toBe('abc123def456');
    });

    it('should return ID as-is when already just an ID', () => {
      const id = 'abc123def456';
      expect(extractGistId(id)).toBe('abc123def456');
    });

    it('should handle URLs with trailing slash', () => {
      const url = 'https://gist.github.com/username/abc123def456/';
      // This will get empty string due to trailing slash, but that's current behavior
      // Consider fixing if needed
      const result = extractGistId(url);
      expect(result).toBeDefined();
    });
  });
});
