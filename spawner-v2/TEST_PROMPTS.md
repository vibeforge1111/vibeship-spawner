# Spawner V2 - Test Prompts for Claude Desktop

> Use these prompts to test each MCP tool and verify it's working correctly.

---

## 1. spawner_context - Load Project Context

### Prompt:
```
Use spawner_context to initialize a new project called "my-saas-app" with stack: nextjs, supabase, tailwind, typescript
```

### Expected Response:
- Creates/loads project in database
- Returns project context with:
  - Project ID and name
  - Stack technologies
  - Relevant skills loaded (nextjs-app-router, supabase-backend, tailwind-ui, typescript-strict)
  - Session info
- Claude should acknowledge the loaded skills and be ready to help with that stack

### What to Look For:
✓ Project created successfully
✓ Skills matched to stack
✓ Context returned with identity/patterns from skills

---

## 2. spawner_validate - Run Code Checks

### Prompt:
```
Use spawner_validate to check this code for issues:

const apiKey = "sk-1234567890abcdef";

export default async function MyComponent() {
  'use client'
  const data = await fetch('/api/data');
  return <div>{data}</div>;
}
```

### Expected Response:
- Should catch multiple issues:
  1. **Hardcoded secret** (critical) - API key in code
  2. **Async client component** (error) - 'use client' with async function
  3. **Fetch without cache config** (warning) - no cache/revalidate options
- Returns severity levels and fix suggestions

### What to Look For:
✓ Detects hardcoded API key
✓ Catches async + 'use client' conflict
✓ Provides actionable fix suggestions

---

## 3. spawner_sharp_edge - Query Gotchas

### Prompt:
```
Use spawner_sharp_edge to find gotchas about "RLS policies not working in Supabase"
```

### Expected Response:
- Returns relevant sharp edges like:
  - **supabase-rls-disabled** - Table has RLS disabled
  - **supabase-rls-no-policy** - RLS enabled but no policies
  - **supabase-auth-uid-missing** - Policy not using auth.uid()
- Each edge includes:
  - Summary of the issue
  - Why it happens
  - Solution with code examples
  - Symptoms to look for

### What to Look For:
✓ Returns multiple relevant edges
✓ Includes practical solutions
✓ Severity levels (critical/high/medium)

---

## 4. spawner_remember - Save Decisions

### Prompt:
```
Use spawner_remember to save this decision:

Type: architecture
Title: Using Server Actions for mutations
Reasoning: Chose Server Actions over API routes because they're simpler, type-safe, and integrate better with React forms. Trade-off is less flexibility for non-React clients.
```

### Expected Response:
- Confirms decision saved to project memory
- Returns decision ID
- Decision will be available in future sessions

### What to Look For:
✓ Decision saved successfully
✓ Returns confirmation with ID
✓ Associates with current project

---

## 5. spawner_unstick - Get Unstuck

### Prompt:
```
Use spawner_unstick with this situation:

I've been trying to fix a hydration mismatch error for 2 hours. I've tried:
1. Adding 'use client' to the component
2. Wrapping in useEffect
3. Using dynamic import with ssr: false

Nothing works. The error keeps coming back.
```

### Expected Response:
- Analyzes the stuck pattern (multiple attempts, same error)
- Suggests alternative approaches:
  - Check if using browser APIs (window, document, localStorage)
  - Look for Date/time rendering differences
  - Consider if state differs between server/client
- Offers to step back and reassess the problem
- May suggest specific sharp edge (nextjs-hydration-mismatch)

### What to Look For:
✓ Recognizes stuck pattern
✓ Offers fresh alternatives
✓ Doesn't repeat already-tried solutions

---

## Combined Test - Full Workflow

### Prompt:
```
Let's build a user dashboard.

1. First, use spawner_context to set up a project "user-dashboard" with nextjs, supabase, typescript

2. Then use spawner_sharp_edge to tell me what gotchas I should know about Next.js auth with Supabase

3. Finally, use spawner_validate on this code I'm planning to use:

'use client'
import { cookies } from 'next/headers'

export default function Dashboard() {
  const session = cookies().get('session')
  return <div>Welcome {session?.value}</div>
}
```

### Expected Response:
1. **Context**: Project created, skills loaded
2. **Sharp Edges**: Returns auth-related edges like:
   - auth-getsession-vs-getuser
   - auth-middleware-order
   - auth-callback-missing
3. **Validate**: Catches critical error:
   - `cookies()` from next/headers in 'use client' component
   - This is server-only and will fail

### What to Look For:
✓ All three tools work in sequence
✓ Context persists across tool calls
✓ Validation catches the server import in client

---

## Troubleshooting

### If tools don't appear:
1. Make sure Spawner dev server is running (`npm run dev` in spawner-v2)
2. Restart Claude Desktop completely
3. Check server is on http://localhost:8787

### If tools error:
1. Check the terminal running `npm run dev` for errors
2. Make sure D1 migrations ran (`npm run db:migrate:local`)
3. Try restarting the dev server

### Server Logs:
Watch the terminal where Spawner is running - it will show:
- Incoming MCP requests
- Tool calls being processed
- Any errors that occur

---

## Success Criteria

| Tool | Working If... |
|------|---------------|
| spawner_context | Returns project + matched skills |
| spawner_validate | Catches code issues with severities |
| spawner_sharp_edge | Returns relevant gotchas with solutions |
| spawner_remember | Saves and confirms decision storage |
| spawner_unstick | Offers alternatives to stuck situation |

All 5 tools working = Spawner V2 is ready! 🚀
