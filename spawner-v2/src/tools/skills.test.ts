import { describe, expect, it, vi } from 'vitest';
import { executeSkills } from './skills.js';
import type { Env } from '../types.js';

function createMockEnv(skillId: string, skillName: string): Env {
  return {
    CACHE: {} as KVNamespace,
    DB: {} as D1Database,
    ENVIRONMENT: 'development',
    SHARP_EDGES: {} as KVNamespace,
    SKILLS: {
      get: vi.fn(async (key: string) => {
        if (key === 'v1:registry') return null;
        if (key === 'skill_index') {
          return {
            skills: [
              {
                id: skillId,
                name: skillName,
                description: '',
                layer: 1,
                tags: [],
                owns: [],
                pairs_with: [],
                triggers: [],
                has_validations: true,
                has_sharp_edges: true,
              },
            ],
          };
        }
        return null;
      }),
    } as unknown as KVNamespace,
  };
}

describe('spawner_skills local paths', () => {
  it.each([
    ['pricing-strategy', 'Pricing Strategy'],
    ['go-to-market', 'Go To Market'],
    ['fundraising-strategy', 'Fundraising Strategy'],
    ['hiring-strategy', 'Hiring Strategy'],
    ['moat-building', 'Moat Building'],
    ['competitive-intelligence', 'Competitive Intelligence'],
  ])('returns strategy path for %s', async (skillId, skillName) => {
    const result = await executeSkills(createMockEnv(skillId, skillName), {
      action: 'local',
      name: skillId,
    });

    expect(result.local_path).toBe(`~/.spawner/skills/strategy/${skillId}`);
    expect(result._instruction).toContain(`~/.spawner/skills/strategy/${skillId}`);
  });
});
