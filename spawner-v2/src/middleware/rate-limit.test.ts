import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getClientIp,
  checkRateLimit,
  createRateLimitError,
  rateLimitHeaders,
  isBlocked,
  blockIp,
  unblockIp,
  trackViolation,
  getToolCost,
  type RateLimitResult,
  type BlocklistEntry,
} from './rate-limit.js';
import type { Env } from '../types.js';

/**
 * Mock KV storage
 */
function createMockKV() {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
    _store: store,
    _clear: () => store.clear(),
  };
}

/**
 * Create mock Env with KV
 */
function createMockEnv(kv = createMockKV()): Env {
  return {
    CACHE: kv as unknown as KVNamespace,
    SKILLS: {} as KVNamespace,
    SHARP_EDGES: {} as KVNamespace,
    DB: {} as D1Database,
    ENVIRONMENT: 'development',
  };
}

describe('Rate Limit Middleware', () => {
  describe('getClientIp', () => {
    it('should extract IP from CF-Connecting-IP header', () => {
      const request = new Request('https://example.com', {
        headers: {
          'CF-Connecting-IP': '1.2.3.4',
        },
      });
      expect(getClientIp(request)).toBe('1.2.3.4');
    });

    it('should extract first IP from X-Forwarded-For header', () => {
      const request = new Request('https://example.com', {
        headers: {
          'X-Forwarded-For': '1.2.3.4, 5.6.7.8, 9.10.11.12',
        },
      });
      expect(getClientIp(request)).toBe('1.2.3.4');
    });

    it('should handle single X-Forwarded-For IP', () => {
      const request = new Request('https://example.com', {
        headers: {
          'X-Forwarded-For': '1.2.3.4',
        },
      });
      expect(getClientIp(request)).toBe('1.2.3.4');
    });

    it('should extract IP from X-Real-IP header', () => {
      const request = new Request('https://example.com', {
        headers: {
          'X-Real-IP': '1.2.3.4',
        },
      });
      expect(getClientIp(request)).toBe('1.2.3.4');
    });

    it('should prefer CF-Connecting-IP over other headers', () => {
      const request = new Request('https://example.com', {
        headers: {
          'CF-Connecting-IP': '1.1.1.1',
          'X-Forwarded-For': '2.2.2.2',
          'X-Real-IP': '3.3.3.3',
        },
      });
      expect(getClientIp(request)).toBe('1.1.1.1');
    });

    it('should return "unknown" when no IP headers present', () => {
      const request = new Request('https://example.com');
      expect(getClientIp(request)).toBe('unknown');
    });

    it('should trim whitespace from IPs', () => {
      const request = new Request('https://example.com', {
        headers: {
          'X-Forwarded-For': '  1.2.3.4  ,  5.6.7.8  ',
        },
      });
      expect(getClientIp(request)).toBe('1.2.3.4');
    });
  });

  describe('checkRateLimit', () => {
    let mockKV: ReturnType<typeof createMockKV>;
    let mockEnv: Env;

    beforeEach(() => {
      mockKV = createMockKV();
      mockEnv = createMockEnv(mockKV);
    });

    it('should allow first request', async () => {
      const result = await checkRateLimit(mockEnv, '1.2.3.4', 'spawner_skills');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(result.window).toBe('minute');
    });

    it('should increment counter on allowed request', async () => {
      await checkRateLimit(mockEnv, '1.2.3.4', 'spawner_skills');

      // Verify KV put was called to increment counters
      expect(mockKV.put).toHaveBeenCalled();
    });

    it('should block request when minute limit exceeded', async () => {
      // Pre-populate with high count (above limit)
      const now = Date.now();
      const windowStart = Math.floor(now / 60000) * 60000;
      const minuteKey = `ratelimit:1.2.3.4:minute:${windowStart}`;

      // spawner_skills has 2x multiplier, so limit is 30 + 10 burst = 40
      mockKV._store.set(minuteKey, '100');

      const result = await checkRateLimit(mockEnv, '1.2.3.4', 'spawner_skills');

      expect(result.allowed).toBe(false);
      expect(result.window).toBe('minute');
    });

    it('should block request when hour limit exceeded', async () => {
      const now = Date.now();
      const minuteStart = Math.floor(now / 60000) * 60000;
      const hourStart = Math.floor(now / 3600000) * 3600000;

      // Set minute under limit but hour over limit
      mockKV._store.set(`ratelimit:1.2.3.4:minute:${minuteStart}`, '5');
      // spawner_skills has 2x multiplier, so hour limit is 180
      mockKV._store.set(`ratelimit:1.2.3.4:hour:${hourStart}`, '200');

      const result = await checkRateLimit(mockEnv, '1.2.3.4', 'spawner_skills');

      expect(result.allowed).toBe(false);
      expect(result.window).toBe('hour');
    });

    it('should apply tool multipliers', async () => {
      // spawner_skills has 2x multiplier
      const skillsResult = await checkRateLimit(mockEnv, '1.2.3.4', 'spawner_skills');

      // spawner_orchestrate has 1x multiplier
      const orchestrateResult = await checkRateLimit(mockEnv, '5.6.7.8', 'spawner_orchestrate');

      // Skills should have higher limit (30 vs 15 base)
      expect(skillsResult.limit).toBeGreaterThan(orchestrateResult.limit);
    });

    it('should use default multiplier for unknown tools', async () => {
      const result = await checkRateLimit(mockEnv, '1.2.3.4', 'unknown_tool');

      // Should use 1.0 multiplier, so 15 + 5 burst = 20 for minute
      expect(result.limit).toBe(20);
    });

    it('should track different IPs separately', async () => {
      // First IP makes many requests
      const now = Date.now();
      const windowStart = Math.floor(now / 60000) * 60000;
      mockKV._store.set(`ratelimit:1.1.1.1:minute:${windowStart}`, '100');

      // Second IP should still be allowed
      const result = await checkRateLimit(mockEnv, '2.2.2.2', 'spawner_orchestrate');

      expect(result.allowed).toBe(true);
    });
  });

  describe('createRateLimitError', () => {
    it('should create JSON-RPC error format', () => {
      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetAt: Math.floor(Date.now() / 1000) + 30,
        limit: 15,
        window: 'minute',
      };

      const error = createRateLimitError(result);

      expect(error.code).toBe(-32000);
      expect(error.message).toContain('Rate limit exceeded');
      expect(error.message).toContain('15 requests per minute');
      expect(error.data.limit).toBe(15);
      expect(error.data.window).toBe('minute');
      expect(error.data.retryAfter).toBeGreaterThan(0);
    });

    it('should format hour window correctly', () => {
      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetAt: Math.floor(Date.now() / 1000) + 1800,
        limit: 90,
        window: 'hour',
      };

      const error = createRateLimitError(result);

      expect(error.message).toContain('per hour');
      expect(error.data.window).toBe('hour');
    });
  });

  describe('rateLimitHeaders', () => {
    it('should generate correct headers', () => {
      const result: RateLimitResult = {
        allowed: true,
        remaining: 14,
        resetAt: 1700000000,
        limit: 15,
        window: 'minute',
      };

      const headers = rateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('15');
      expect(headers['X-RateLimit-Remaining']).toBe('14');
      expect(headers['X-RateLimit-Reset']).toBe('1700000000');
      expect(headers['X-RateLimit-Window']).toBe('minute');
    });

    it('should handle zero remaining', () => {
      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetAt: 1700000000,
        limit: 15,
        window: 'minute',
      };

      const headers = rateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });
  });

  describe('IP Blocklist', () => {
    let mockKV: ReturnType<typeof createMockKV>;
    let mockEnv: Env;

    beforeEach(() => {
      mockKV = createMockKV();
      mockEnv = createMockEnv(mockKV);
    });

    describe('isBlocked', () => {
      it('should return null for non-blocked IP', async () => {
        const result = await isBlocked(mockEnv, '1.2.3.4');
        expect(result).toBeNull();
      });

      it('should return block entry for blocked IP', async () => {
        const entry: BlocklistEntry = {
          ip: '1.2.3.4',
          reason: 'Test block',
          blockedAt: Date.now(),
          violations: 5,
        };
        mockKV._store.set('blocklist:1.2.3.4', JSON.stringify(entry));

        const result = await isBlocked(mockEnv, '1.2.3.4');

        expect(result).not.toBeNull();
        expect(result?.ip).toBe('1.2.3.4');
        expect(result?.reason).toBe('Test block');
      });

      it('should auto-remove expired blocks', async () => {
        const entry: BlocklistEntry = {
          ip: '1.2.3.4',
          reason: 'Expired block',
          blockedAt: Date.now() - 3600000,
          expiresAt: Date.now() - 1000, // Expired 1 second ago
          violations: 5,
        };
        mockKV._store.set('blocklist:1.2.3.4', JSON.stringify(entry));

        const result = await isBlocked(mockEnv, '1.2.3.4');

        expect(result).toBeNull();
        expect(mockKV.delete).toHaveBeenCalledWith('blocklist:1.2.3.4');
      });
    });

    describe('blockIp', () => {
      it('should add IP to blocklist', async () => {
        await blockIp(mockEnv, '1.2.3.4', 'Test block');

        const stored = mockKV._store.get('blocklist:1.2.3.4');
        expect(stored).toBeDefined();

        const entry = JSON.parse(stored!) as BlocklistEntry;
        expect(entry.ip).toBe('1.2.3.4');
        expect(entry.reason).toBe('Test block');
      });

      it('should set expiration for temporary blocks', async () => {
        await blockIp(mockEnv, '1.2.3.4', 'Temp block', {
          durationMs: 60000, // 1 minute
        });

        const stored = mockKV._store.get('blocklist:1.2.3.4');
        const entry = JSON.parse(stored!) as BlocklistEntry;

        expect(entry.expiresAt).toBeDefined();
        expect(entry.expiresAt).toBeGreaterThan(Date.now());
      });

      it('should not set expiration for permanent blocks', async () => {
        await blockIp(mockEnv, '1.2.3.4', 'Permanent block');

        const stored = mockKV._store.get('blocklist:1.2.3.4');
        const entry = JSON.parse(stored!) as BlocklistEntry;

        expect(entry.expiresAt).toBeUndefined();
      });
    });

    describe('unblockIp', () => {
      it('should remove IP from blocklist', async () => {
        mockKV._store.set('blocklist:1.2.3.4', JSON.stringify({ ip: '1.2.3.4' }));

        const result = await unblockIp(mockEnv, '1.2.3.4');

        expect(result).toBe(true);
        expect(mockKV.delete).toHaveBeenCalledWith('blocklist:1.2.3.4');
      });

      it('should return false for non-blocked IP', async () => {
        const result = await unblockIp(mockEnv, '1.2.3.4');
        expect(result).toBe(false);
      });
    });

    describe('trackViolation', () => {
      it('should increment violation count', async () => {
        const result1 = await trackViolation(mockEnv, '1.2.3.4', 'test');
        expect(result1.violations).toBe(1);
        expect(result1.blocked).toBe(false);

        const result2 = await trackViolation(mockEnv, '1.2.3.4', 'test');
        expect(result2.violations).toBe(2);
      });

      it('should auto-block after 10 violations', async () => {
        // Set violation count to 9
        mockKV._store.set('violations:1.2.3.4', '9');

        const result = await trackViolation(mockEnv, '1.2.3.4', 'rate_limit');

        expect(result.violations).toBe(10);
        expect(result.blocked).toBe(true);

        // Check blocklist entry was created
        const blockEntry = mockKV._store.get('blocklist:1.2.3.4');
        expect(blockEntry).toBeDefined();
      });
    });
  });

  describe('Cost-based Rate Limiting', () => {
    let mockKV: ReturnType<typeof createMockKV>;
    let mockEnv: Env;

    beforeEach(() => {
      mockKV = createMockKV();
      mockEnv = createMockEnv(mockKV);
    });

    describe('getToolCost', () => {
      it('should return correct costs for known tools', () => {
        expect(getToolCost('spawner_skills')).toBe(1);
        expect(getToolCost('spawner_validate')).toBe(3);
        expect(getToolCost('spawner_skill_new')).toBe(15);
      });

      it('should return default cost for unknown tools', () => {
        expect(getToolCost('unknown_tool')).toBe(5);
      });
    });

    describe('checkRateLimit with costs', () => {
      it('should block when cost budget exceeded', async () => {
        const now = Date.now();
        const windowStart = Math.floor(now / 60000) * 60000;

        // Set cost near limit (50 per minute default)
        mockKV._store.set(`ratelimit:cost:1.2.3.4:minute:${windowStart}`, '48');

        // spawner_skill_new costs 15, would exceed 50
        const result = await checkRateLimit(mockEnv, '1.2.3.4', 'spawner_skill_new');

        expect(result.allowed).toBe(false);
      });

      it('should allow cheap ops even when count is moderate', async () => {
        const now = Date.now();
        const windowStart = Math.floor(now / 60000) * 60000;

        // Many requests but low cost
        mockKV._store.set(`ratelimit:1.2.3.4:minute:${windowStart}`, '10');
        mockKV._store.set(`ratelimit:cost:1.2.3.4:minute:${windowStart}`, '10');

        // spawner_skills costs 1
        const result = await checkRateLimit(mockEnv, '1.2.3.4', 'spawner_skills');

        expect(result.allowed).toBe(true);
      });

      it('should include costRemaining in result', async () => {
        const result = await checkRateLimit(mockEnv, '1.2.3.4', 'spawner_skills');

        expect(result.costRemaining).toBeDefined();
        expect(result.costRemaining).toBeGreaterThan(0);
      });
    });
  });

  describe('Blocked IP in checkRateLimit', () => {
    let mockKV: ReturnType<typeof createMockKV>;
    let mockEnv: Env;

    beforeEach(() => {
      mockKV = createMockKV();
      mockEnv = createMockEnv(mockKV);
    });

    it('should reject blocked IPs immediately', async () => {
      const entry: BlocklistEntry = {
        ip: '1.2.3.4',
        reason: 'Bad actor',
        blockedAt: Date.now(),
        violations: 10,
      };
      mockKV._store.set('blocklist:1.2.3.4', JSON.stringify(entry));

      const result = await checkRateLimit(mockEnv, '1.2.3.4', 'spawner_skills');

      expect(result.allowed).toBe(false);
      expect(result.blocked).toBe(true);
    });

    it('should create blocked error with correct code', () => {
      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetAt: Math.floor(Date.now() / 1000) + 3600,
        limit: 0,
        window: 'hour',
        blocked: true,
      };

      const error = createRateLimitError(result);

      expect(error.code).toBe(-32001);
      expect(error.message).toContain('Access denied');
      expect(error.data.blocked).toBe(true);
    });
  });
});
