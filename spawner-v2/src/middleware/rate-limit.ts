/**
 * Rate Limiting Middleware for Spawner MCP
 *
 * Uses Cloudflare KV (CACHE) for distributed rate limiting.
 * Features:
 * - Per-IP rate limiting with sliding windows
 * - Cost-based limits (expensive ops cost more)
 * - IP blocklist for persistent bad actors
 * - Per-tool multipliers
 */

import type { Env } from '../types.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstAllowance: number;
  costPerMinute: number;  // Cost budget per minute
  costPerHour: number;    // Cost budget per hour
}

/**
 * Tool costs - expensive operations cost more of the budget
 * Scale: 1 = cheap/fast, 5 = moderate, 10+ = expensive
 */
const TOOL_COSTS: Record<string, number> = {
  // Cheap - simple lookups
  spawner_skills: 1,
  spawner_templates: 1,
  spawner_watch_out: 1,

  // Moderate - some processing
  spawner_validate: 3,
  spawner_load: 3,
  spawner_remember: 2,
  spawner_unstick: 3,

  // Expensive - heavy processing or AI calls
  spawner_orchestrate: 5,
  spawner_plan: 8,
  spawner_analyze: 5,

  // Most expensive - skill creation pipeline
  spawner_skill_brainstorm: 10,
  spawner_skill_research: 8,
  spawner_skill_new: 15,
  spawner_skill_score: 5,
  spawner_skill_upgrade: 10,
};

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

  // Skill creation - slightly tighter
  spawner_skill_brainstorm: 0.8,
  spawner_skill_research: 0.8,
  spawner_skill_new: 0.5,
  spawner_skill_score: 1.0,
  spawner_skill_upgrade: 0.8,
};

/**
 * Base rate limits (per IP)
 */
const BASE_LIMITS: RateLimitConfig = {
  requestsPerMinute: 15,
  requestsPerHour: 90,
  burstAllowance: 5,
  costPerMinute: 50,   // Can spend 50 cost units per minute
  costPerHour: 200,    // Can spend 200 cost units per hour
};

// ============================================================================
// TYPES
// ============================================================================

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp
  limit: number;
  window: 'minute' | 'hour';
  blocked?: boolean;        // True if IP is on blocklist
  costRemaining?: number;   // Cost budget remaining
}

/**
 * Blocklist entry with metadata
 */
export interface BlocklistEntry {
  ip: string;
  reason: string;
  blockedAt: number;      // Unix timestamp
  expiresAt?: number;     // Optional expiration (permanent if undefined)
  violations: number;     // Count of violations before block
}

/**
 * Rate limit error for JSON-RPC response
 */
export interface RateLimitError {
  code: -32000 | -32001;  // -32000 = rate limit, -32001 = blocked
  message: string;
  data: {
    retryAfter: number;
    limit: number;
    window: 'minute' | 'hour';
    blocked?: boolean;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the effective rate limit for a specific tool
 */
function getToolLimits(toolName: string): RateLimitConfig {
  const multiplier = TOOL_MULTIPLIERS[toolName] ?? 1.0;
  return {
    requestsPerMinute: Math.floor(BASE_LIMITS.requestsPerMinute * multiplier),
    requestsPerHour: Math.floor(BASE_LIMITS.requestsPerHour * multiplier),
    burstAllowance: Math.floor(BASE_LIMITS.burstAllowance * multiplier),
    costPerMinute: Math.floor(BASE_LIMITS.costPerMinute * multiplier),
    costPerHour: Math.floor(BASE_LIMITS.costPerHour * multiplier),
  };
}

/**
 * Get the cost of a specific tool
 */
export function getToolCost(toolName: string): number {
  return TOOL_COSTS[toolName] ?? 5; // Default to moderate cost
}

/**
 * Get client IP from request
 * Cloudflare provides CF-Connecting-IP header
 */
export function getClientIp(request: Request): string {
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return cfIp;

  const forwardedFor = request.headers.get('X-Forwarded-For');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    return firstIp ? firstIp.trim() : forwardedFor.trim();
  }

  const realIp = request.headers.get('X-Real-IP');
  if (realIp) return realIp;

  return 'unknown';
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
 * Generate cost tracking key for KV storage
 */
function getCostKey(ip: string, window: 'minute' | 'hour'): string {
  const now = Date.now();
  const windowStart =
    window === 'minute'
      ? Math.floor(now / 60000) * 60000
      : Math.floor(now / 3600000) * 3600000;

  return `ratelimit:cost:${ip}:${window}:${windowStart}`;
}

// ============================================================================
// BLOCKLIST FUNCTIONS
// ============================================================================

/**
 * Check if an IP is on the blocklist
 */
export async function isBlocked(env: Env, ip: string): Promise<BlocklistEntry | null> {
  const key = `blocklist:${ip}`;
  const entryStr = await env.CACHE.get(key);

  if (!entryStr) return null;

  try {
    const entry = JSON.parse(entryStr) as BlocklistEntry;

    // Check if block has expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      // Block expired, remove it
      await env.CACHE.delete(key);
      return null;
    }

    return entry;
  } catch {
    return null;
  }
}

/**
 * Add an IP to the blocklist
 */
export async function blockIp(
  env: Env,
  ip: string,
  reason: string,
  options?: {
    durationMs?: number;  // How long to block (undefined = permanent)
    violations?: number;  // Number of violations that led to block
  }
): Promise<void> {
  const entry: BlocklistEntry = {
    ip,
    reason,
    blockedAt: Date.now(),
    expiresAt: options?.durationMs ? Date.now() + options.durationMs : undefined,
    violations: options?.violations ?? 0,
  };

  const key = `blocklist:${ip}`;

  // TTL for KV - if permanent, use 30 days (can renew), otherwise use duration + buffer
  const ttlSeconds = options?.durationMs
    ? Math.ceil(options.durationMs / 1000) + 3600 // duration + 1 hour buffer
    : 30 * 24 * 3600; // 30 days for "permanent" blocks

  await env.CACHE.put(key, JSON.stringify(entry), { expirationTtl: ttlSeconds });
}

/**
 * Remove an IP from the blocklist
 */
export async function unblockIp(env: Env, ip: string): Promise<boolean> {
  const key = `blocklist:${ip}`;
  const exists = await env.CACHE.get(key);

  if (exists) {
    await env.CACHE.delete(key);
    return true;
  }

  return false;
}

/**
 * Track violations and auto-block repeat offenders
 */
export async function trackViolation(
  env: Env,
  ip: string,
  reason: string
): Promise<{ blocked: boolean; violations: number }> {
  const violationKey = `violations:${ip}`;
  const countStr = await env.CACHE.get(violationKey);
  const count = (countStr ? parseInt(countStr, 10) : 0) + 1;

  // Store with 24-hour TTL
  await env.CACHE.put(violationKey, count.toString(), { expirationTtl: 86400 });

  // Auto-block after 10 violations in 24 hours
  if (count >= 10) {
    await blockIp(env, ip, `Auto-blocked: ${reason} (${count} violations in 24h)`, {
      durationMs: 24 * 60 * 60 * 1000, // 24 hour block
      violations: count,
    });
    return { blocked: true, violations: count };
  }

  return { blocked: false, violations: count };
}

// ============================================================================
// RATE LIMIT FUNCTIONS
// ============================================================================

/**
 * Check rate limit for a request
 *
 * Checks in order:
 * 1. IP blocklist (immediate reject)
 * 2. Request count limits (per minute/hour)
 * 3. Cost budget limits (expensive ops consume more budget)
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
  // 1. Check blocklist first
  const blockEntry = await isBlocked(env, ip);
  if (blockEntry) {
    const now = Date.now();
    const resetAt = blockEntry.expiresAt
      ? Math.floor(blockEntry.expiresAt / 1000)
      : Math.floor((now + 24 * 60 * 60 * 1000) / 1000); // Show 24h if permanent

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      limit: 0,
      window: 'hour',
      blocked: true,
    };
  }

  const limits = getToolLimits(toolName);
  const toolCost = getToolCost(toolName);

  // 2. Check request count - minute window first (more restrictive)
  const minuteResult = await checkWindow(env, ip, 'minute', limits.requestsPerMinute + limits.burstAllowance);
  if (!minuteResult.allowed) {
    // Track violation for repeated limit hits
    await trackViolation(env, ip, 'rate_limit_exceeded');
    return minuteResult;
  }

  // 3. Check request count - hour window
  const hourResult = await checkWindow(env, ip, 'hour', limits.requestsPerHour);
  if (!hourResult.allowed) {
    await trackViolation(env, ip, 'rate_limit_exceeded');
    return hourResult;
  }

  // 4. Check cost budget - minute window
  const minuteCostResult = await checkCostWindow(env, ip, 'minute', limits.costPerMinute, toolCost);
  if (!minuteCostResult.allowed) {
    await trackViolation(env, ip, 'cost_budget_exceeded');
    return {
      ...minuteCostResult,
      costRemaining: minuteCostResult.remaining,
    };
  }

  // 5. Check cost budget - hour window
  const hourCostResult = await checkCostWindow(env, ip, 'hour', limits.costPerHour, toolCost);
  if (!hourCostResult.allowed) {
    await trackViolation(env, ip, 'cost_budget_exceeded');
    return {
      ...hourCostResult,
      costRemaining: hourCostResult.remaining,
    };
  }

  // All checks passed - increment counters
  await incrementCounters(env, ip, toolCost);

  return {
    ...minuteResult,
    costRemaining: limits.costPerMinute - toolCost,
  };
}

/**
 * Check a specific time window for request count
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
 * Check cost budget for a time window
 */
async function checkCostWindow(
  env: Env,
  ip: string,
  window: 'minute' | 'hour',
  budget: number,
  cost: number
): Promise<RateLimitResult> {
  const key = getCostKey(ip, window);
  const spentStr = await env.CACHE.get(key);
  const spent = spentStr ? parseInt(spentStr, 10) : 0;

  const now = Date.now();
  const windowMs = window === 'minute' ? 60000 : 3600000;
  const windowStart =
    window === 'minute'
      ? Math.floor(now / 60000) * 60000
      : Math.floor(now / 3600000) * 3600000;
  const resetAt = Math.floor((windowStart + windowMs) / 1000);

  // Check if adding this cost would exceed budget
  const wouldExceed = spent + cost > budget;

  return {
    allowed: !wouldExceed,
    remaining: Math.max(0, budget - spent - cost),
    resetAt,
    limit: budget,
    window,
  };
}

/**
 * Increment rate limit counters (request count + cost)
 */
async function incrementCounters(env: Env, ip: string, cost: number): Promise<void> {
  const minuteKey = getRateLimitKey(ip, 'minute');
  const hourKey = getRateLimitKey(ip, 'hour');
  const minuteCostKey = getCostKey(ip, 'minute');
  const hourCostKey = getCostKey(ip, 'hour');

  // Get current counts
  const [minuteStr, hourStr, minuteCostStr, hourCostStr] = await Promise.all([
    env.CACHE.get(minuteKey),
    env.CACHE.get(hourKey),
    env.CACHE.get(minuteCostKey),
    env.CACHE.get(hourCostKey),
  ]);

  const minuteCount = (minuteStr ? parseInt(minuteStr, 10) : 0) + 1;
  const hourCount = (hourStr ? parseInt(hourStr, 10) : 0) + 1;
  const minuteCost = (minuteCostStr ? parseInt(minuteCostStr, 10) : 0) + cost;
  const hourCost = (hourCostStr ? parseInt(hourCostStr, 10) : 0) + cost;

  // Write back with TTL
  await Promise.all([
    env.CACHE.put(minuteKey, minuteCount.toString(), { expirationTtl: 120 }),
    env.CACHE.put(hourKey, hourCount.toString(), { expirationTtl: 7200 }),
    env.CACHE.put(minuteCostKey, minuteCost.toString(), { expirationTtl: 120 }),
    env.CACHE.put(hourCostKey, hourCost.toString(), { expirationTtl: 7200 }),
  ]);
}

/**
 * Create JSON-RPC error response for rate limiting or blocked IP
 */
export function createRateLimitError(result: RateLimitResult): RateLimitError {
  const retryAfter = Math.max(0, result.resetAt - Math.floor(Date.now() / 1000));
  const windowName = result.window === 'minute' ? 'minute' : 'hour';

  // Blocked IPs get a different error code and message
  if (result.blocked) {
    return {
      code: -32001,
      message: `Access denied. Your IP has been temporarily blocked due to excessive requests. Try again in ${retryAfter} seconds.`,
      data: {
        retryAfter,
        limit: 0,
        window: result.window,
        blocked: true,
      },
    };
  }

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
