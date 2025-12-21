/**
 * Rate Limiting Middleware for Spawner MCP
 *
 * Uses Cloudflare KV (CACHE) for distributed rate limiting.
 * Implements sliding window rate limiting with per-IP and per-tool limits.
 */

import type { Env } from '../types.js';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstAllowance: number; // Extra requests allowed in burst
}

/**
 * Per-tool rate limit multipliers (relative to base limits)
 * Higher multiplier = more generous limit
 */
const TOOL_MULTIPLIERS: Record<string, number> = {
  // Most generous - users search frequently
  spawner_skills: 2.0,

  // Generous - multiple validates per session
  spawner_validate: 1.5,

  // Standard limits
  spawner_orchestrate: 1.0,
  spawner_remember: 1.0,
  spawner_watch_out: 1.0,
  spawner_load: 1.0,
  spawner_unstick: 1.0,
  spawner_templates: 1.0,
  spawner_plan: 1.0,
  spawner_analyze: 1.0,

  // Skill creation pipeline - moderate use
  spawner_skill_brainstorm: 1.0,
  spawner_skill_research: 1.0,
  spawner_skill_new: 1.0,
  spawner_skill_score: 1.0,
  spawner_skill_upgrade: 1.0,
};

/**
 * Base rate limits (per IP)
 */
const BASE_LIMITS: RateLimitConfig = {
  requestsPerMinute: 15,
  requestsPerHour: 90,
  burstAllowance: 5, // Allow 5 extra requests in burst scenarios
};

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp
  limit: number;
  window: 'minute' | 'hour';
}

/**
 * Rate limit error for JSON-RPC response
 */
export interface RateLimitError {
  code: -32000;
  message: string;
  data: {
    retryAfter: number; // Seconds until reset
    limit: number;
    window: 'minute' | 'hour';
  };
}

/**
 * Get the effective rate limit for a specific tool
 */
function getToolLimits(toolName: string): RateLimitConfig {
  const multiplier = TOOL_MULTIPLIERS[toolName] ?? 1.0;
  return {
    requestsPerMinute: Math.floor(BASE_LIMITS.requestsPerMinute * multiplier),
    requestsPerHour: Math.floor(BASE_LIMITS.requestsPerHour * multiplier),
    burstAllowance: Math.floor(BASE_LIMITS.burstAllowance * multiplier),
  };
}

/**
 * Get client IP from request
 * Cloudflare provides CF-Connecting-IP header
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ??
    request.headers.get('X-Real-IP') ??
    'unknown'
  );
}

/**
 * Generate rate limit key for KV storage
 */
function getRateLimitKey(ip: string, window: 'minute' | 'hour'): string {
  const now = Date.now();
  const windowStart =
    window === 'minute'
      ? Math.floor(now / 60000) * 60000 // Round to minute
      : Math.floor(now / 3600000) * 3600000; // Round to hour

  return `ratelimit:${ip}:${window}:${windowStart}`;
}

/**
 * Check rate limit for a request
 *
 * @param env - Cloudflare environment bindings
 * @param ip - Client IP address
 * @param toolName - Name of the tool being called
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  env: Env,
  ip: string,
  toolName: string
): Promise<RateLimitResult> {
  const limits = getToolLimits(toolName);

  // Check minute window first (more restrictive)
  const minuteResult = await checkWindow(env, ip, 'minute', limits.requestsPerMinute + limits.burstAllowance);
  if (!minuteResult.allowed) {
    return minuteResult;
  }

  // Then check hour window
  const hourResult = await checkWindow(env, ip, 'hour', limits.requestsPerHour);
  if (!hourResult.allowed) {
    return hourResult;
  }

  // Both passed - increment counters
  await incrementCounters(env, ip);

  return minuteResult; // Return minute window info (more relevant for UX)
}

/**
 * Check a specific time window
 */
async function checkWindow(
  env: Env,
  ip: string,
  window: 'minute' | 'hour',
  limit: number
): Promise<RateLimitResult> {
  const key = getRateLimitKey(ip, window);
  const countStr = await env.CACHE.get(key);
  const count = countStr ? parseInt(countStr, 10) : 0;

  const now = Date.now();
  const windowMs = window === 'minute' ? 60000 : 3600000;
  const windowStart =
    window === 'minute'
      ? Math.floor(now / 60000) * 60000
      : Math.floor(now / 3600000) * 3600000;
  const resetAt = Math.floor((windowStart + windowMs) / 1000);

  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count - 1),
    resetAt,
    limit,
    window,
  };
}

/**
 * Increment rate limit counters
 */
async function incrementCounters(env: Env, ip: string): Promise<void> {
  const minuteKey = getRateLimitKey(ip, 'minute');
  const hourKey = getRateLimitKey(ip, 'hour');

  // Get current counts
  const [minuteStr, hourStr] = await Promise.all([
    env.CACHE.get(minuteKey),
    env.CACHE.get(hourKey),
  ]);

  const minuteCount = (minuteStr ? parseInt(minuteStr, 10) : 0) + 1;
  const hourCount = (hourStr ? parseInt(hourStr, 10) : 0) + 1;

  // Write back with TTL
  await Promise.all([
    env.CACHE.put(minuteKey, minuteCount.toString(), { expirationTtl: 120 }), // 2 min TTL
    env.CACHE.put(hourKey, hourCount.toString(), { expirationTtl: 7200 }), // 2 hour TTL
  ]);
}

/**
 * Create JSON-RPC error response for rate limiting
 */
export function createRateLimitError(result: RateLimitResult): RateLimitError {
  const retryAfter = result.resetAt - Math.floor(Date.now() / 1000);
  const windowName = result.window === 'minute' ? 'minute' : 'hour';

  return {
    code: -32000,
    message: `Rate limit exceeded. ${result.limit} requests per ${windowName} allowed. Try again in ${retryAfter} seconds.`,
    data: {
      retryAfter,
      limit: result.limit,
      window: result.window,
    },
  };
}

/**
 * Add rate limit headers to response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toString(),
    'X-RateLimit-Window': result.window,
  };
}
