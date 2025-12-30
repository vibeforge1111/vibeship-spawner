# Spawner + Mind Animation Redesign

> Design for the "Spawner + Mind = Full Stack Claude" section on the homepage

## Goals

- **Primary**: "I need this now" - urgency, showing problems being solved in real-time
- **Secondary**: Impressive and clear - powerful but easy to understand

## Animation Approach

**Story playthrough loop** (~25 seconds per cycle)

The animation tells a complete narrative showing how Spawner and Mind work together, then loops.

## The Story: "First Time to Flow State"

| Step | Duration | What Happens | User Feeling |
|------|----------|--------------|--------------|
| **1. Connect** | ~4s | User adds Spawner + Mind to existing project | "Let's see what this does" |
| **2. Analyze** | ~5s | Spawner scans codebase, detects stack, loads skills | "It figured out my stack" |
| **3. Build** | ~6s | User asks to add feature, Claude builds with expertise | "This output is better" |
| **4. Catch** | ~5s | Spawner catches issue inline, fixes silently | "Glad I didn't ship that" |
| **5. Flow** | ~5s | Feature done, Mind remembers, user in the zone | "I'm shipping faster" |

### Chat Messages Script

1. **User**: "Analyze this codebase and load the right skills"
2. **Spawner**: "Detected: Next.js 14, Supabase, Stripe. Loading supabase-backend, payments-flow..."
3. **Mind**: "Project indexed. I'll remember decisions and context."
4. **User**: "Add invoice status updates when payment completes"
5. **Claude**: [builds with expertise, code appears]
6. **Spawner**: [subtle catch] "Fixed: moved SUPABASE_KEY to env"
7. **Result**: "Feature complete. Mind tracking. See you next session."

## Layout Structure

### Desktop (>768px)

```
+-------------------------------------------------------------+
|              "Spawner + Mind = Full Stack Claude"           |
|                 "Watch how they work together"              |
+-------------------------------------------------------------+
|  +---------+      +---------------------+      +---------+  |
|  |  MIND   | -->  |    CHAT STAGE       |  <-- | SPAWNER |  |
|  |  Panel  |      |   (Claude convo)    |      |  Panel  |  |
|  |         |      |                     |      |         |  |
|  | - recall|      |  Messages animate   |      | - skills|  |
|  | - index |      |  in sequence        |      | - detect|  |
|  | - track |      |                     |      | - catch |  |
|  +---------+      +---------------------+      +---------+  |
+-------------------------------------------------------------+
|   o---------*---------o---------o---------o                 |
|   Connect   Analyze   Build     Catch     Flow              |
+-------------------------------------------------------------+
|        "Spawner gives Claude expertise..."                  |
|              [ Get Started ]                                |
+-------------------------------------------------------------+
```

### Mobile (<768px)

```
+-----------------------------+
|  "Spawner + Mind = ..."     |
+-----------------------------+
|  +---------------------+    |
|  |    CHAT STAGE       |    |
|  |  (full width)       |    |
|  +---------------------+    |
+-----------------------------+
|  +----------+----------+    |
|  |  MIND    | SPAWNER  |    |
|  |  (mini)  |  (mini)  |    |
|  +----------+----------+    |
+-----------------------------+
|  o----*----o----o----o      |
+-----------------------------+
|  "Spawner gives Claude..."  |
|      [ Get Started ]        |
+-----------------------------+
```

## Visual Details

### Side Panels (Mind & Spawner)

- Start dimmed/inactive
- Glow with accent color when active (purple=Mind, green=Spawner)
- Show mini-list of actions, items fade in one by one
- Connecting line pulses toward center when feeding data

### Center Chat Stage

- Claude Desktop style conversation
- Messages appear with typing animation
- User messages: slide in from bottom-right
- Claude/System messages: slide in from bottom-left
- Spawner interventions: subtle green flash border
- Code blocks: syntax highlighting, caught parts get highlighted

### Timeline Rail

- 5 nodes: Connect -> Analyze -> Build -> Catch -> Flow
- Current step: filled + glowing
- Completed: checkmark
- Upcoming: hollow/dimmed
- Progress line animates between nodes

### Transitions

- Each step holds ~4-5 seconds
- Smooth crossfade between steps
- Pause at end, then reset and loop

## Mobile Adaptations

- Side panels move below chat as compact horizontal pills
- Active panel expands, inactive shrinks
- Timeline touch-friendly (tappable to jump)
- Chat messages full width, slightly smaller text
- Typing animations slightly faster

## Removed

The 4 static capability cards below (Mind recalls, Spawner validates, etc.) are removed. The animation demonstrates all capabilities in action.

## Kept

- Result tagline: "Spawner gives Claude expertise. Mind gives Claude memory..."
- Install hint: "Both install as MCP servers..."
- "Get Started" CTA button

## Technical Notes

- Use Svelte transitions and CSS animations
- Scroll-triggered start (IntersectionObserver)
- Pause on tab hidden (requestAnimationFrame or visibilitychange)
- State machine for story steps
