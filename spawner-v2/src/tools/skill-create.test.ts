import { describe, expect, it, vi } from 'vitest';
import { executeSkillCreate } from './skill-create.js';
import type { Env } from '../types.js';

function createMockEnv(skillsIndex: unknown): Env {
  return {
    CACHE: {} as KVNamespace,
    DB: {} as D1Database,
    ENVIRONMENT: 'development',
    SHARP_EDGES: {} as KVNamespace,
    SKILLS: {
      get: vi.fn(async (key: string) => (key === 'skill_index' ? skillsIndex : null)),
    } as unknown as KVNamespace,
  };
}

describe('spawner_skill_new', () => {
  it('scaffolds when skill index contains malformed rows without ids', async () => {
    const env = createMockEnv({
      skills: [
        { name: 'Malformed Skill Without ID' },
        { id: undefined, name: undefined },
      ],
    });

    await expect(
      executeSkillCreate(env, {
        action: 'scaffold',
        id: 'kraken-os',
        name: 'Kraken OS',
        category: 'pattern',
        description: 'Unified L4 orchestration bible',
      })
    ).resolves.toMatchObject({
      action: 'scaffold',
      skill_id: 'kraken-os',
      category: 'pattern',
    });
  });

  it('still detects an existing skill by id', async () => {
    const env = createMockEnv({
      skills: [
        { id: 'kraken-os', name: 'Kraken OS' },
      ],
    });

    const result = await executeSkillCreate(env, {
      action: 'scaffold',
      id: 'kraken-os',
      name: 'Kraken OS',
      category: 'pattern',
    });

    expect(result.files).toBeUndefined();
    expect(result._instruction).toContain('Skill Already Exists');
  });
});
