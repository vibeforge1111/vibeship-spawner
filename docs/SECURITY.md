# Security: Rate Limiting & Protection

This document covers the security features implemented to protect the Spawner MCP server from abuse.

## Rate Limiting Overview

The rate limiter uses multiple layers of protection:

| Layer | Protection | Auto-enforced |
|-------|------------|---------------|
| IP Blocklist | Persistent bad actors | Yes (after 10 violations) |
| Request Count | Per-minute/hour limits | Yes |
| Cost Budget | Expensive operation limits | Yes |
| Violation Tracking | Escalating consequences | Yes |

## Configuration

### Base Limits (per IP)
- **15 requests/minute** (+ 5 burst allowance)
- **90 requests/hour**
- **50 cost units/minute**
- **200 cost units/hour**

### Tool Costs
Expensive operations consume more of the cost budget:

| Cost | Tools |
|------|-------|
| 1 | spawner_skills, spawner_templates, spawner_watch_out |
| 2-3 | spawner_validate, spawner_load, spawner_remember, spawner_unstick |
| 5 | spawner_orchestrate, spawner_analyze, spawner_skill_score |
| 8-10 | spawner_plan, spawner_skill_brainstorm, spawner_skill_research, spawner_skill_upgrade |
| 15 | spawner_skill_new |

### Tool Multipliers
Some tools get higher limits:
- `spawner_skills`: 2x (users search frequently)
- `spawner_validate`: 1.5x (multiple validates per session)
- `spawner_skill_new`: 0.5x (expensive, needs tighter limits)

## Automatic Protection

### Violation Tracking
When a request is rate-limited:
1. Violation counter increments (stored in KV, 24h TTL)
2. After **10 violations in 24 hours**: IP is auto-blocked for 24 hours
3. Block entry stored with reason and violation count

### Error Responses
Rate-limited requests receive JSON-RPC errors:
- **-32000**: Rate limit exceeded (temporary)
- **-32001**: IP blocked (access denied)

Both include `retryAfter` seconds in the response.

## Cloudflare WAF Rules (Recommended)

For additional protection at the edge, configure these Cloudflare WAF rules:

### 1. Block Known Bad Bots
```
Rule name: Block Bad Bots
When: (http.user_agent contains "curl" and not cf.client.bot) or
      (http.user_agent contains "python-requests") or
      (http.user_agent eq "")
Action: Block
```

### 2. Rate Limit at Edge
```
Rule name: Edge Rate Limit
When: (http.request.uri.path eq "/mcp")
Rate: 30 requests per 10 seconds
Action: Block for 1 minute
```

### 3. Challenge Suspicious Traffic
```
Rule name: Challenge High Volume
When: (cf.threat_score gt 10) and (http.request.uri.path eq "/mcp")
Action: Managed Challenge
```

### 4. Geographic Restrictions (Optional)
```
Rule name: Block High-Risk Countries
When: (ip.geoip.country in {"XX" "YY"}) and (http.request.uri.path eq "/mcp")
Action: Block
```

### 5. Block Known Attack Patterns
```
Rule name: Block SQL/XSS in Body
When: (http.request.body.raw contains "SELECT" and http.request.body.raw contains "FROM") or
      (http.request.body.raw contains "<script")
Action: Block
```

## How to Configure WAF Rules

1. Go to Cloudflare Dashboard > Security > WAF
2. Click "Create rule"
3. Use the Expression Builder or edit expression directly
4. Set appropriate action (Block, Challenge, Log)
5. Deploy the rule

## Monitoring

### Headers Returned
Every response includes rate limit info:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1700000000
X-RateLimit-Window: minute
```

### KV Keys Used
- `blocklist:{ip}` - Blocked IP entries
- `violations:{ip}` - Violation counters (24h TTL)
- `ratelimit:{ip}:{window}:{timestamp}` - Request counts
- `ratelimit:cost:{ip}:{window}:{timestamp}` - Cost tracking

## Manual Operations

### Block an IP
```typescript
import { blockIp } from './middleware/rate-limit.js';

// Temporary block (24 hours)
await blockIp(env, '1.2.3.4', 'Manual block: abuse detected', {
  durationMs: 24 * 60 * 60 * 1000,
});

// Permanent block (30 days, auto-renews on access attempt)
await blockIp(env, '1.2.3.4', 'Manual block: persistent abuse');
```

### Unblock an IP
```typescript
import { unblockIp } from './middleware/rate-limit.js';

await unblockIp(env, '1.2.3.4');
```

### Check if IP is Blocked
```typescript
import { isBlocked } from './middleware/rate-limit.js';

const entry = await isBlocked(env, '1.2.3.4');
if (entry) {
  console.log(`Blocked: ${entry.reason}`);
}
```

## Best Practices

1. **Monitor logs** for patterns of rate-limited requests
2. **Use Cloudflare WAF** for edge protection before requests hit Workers
3. **Review auto-blocks** periodically to catch false positives
4. **Adjust limits** based on actual usage patterns
5. **Never expose** the blocklist management functions to end users
