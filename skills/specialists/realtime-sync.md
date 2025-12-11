---
name: realtime-sync
description: Use when implementing live updates or collaborative features - enforces proper channel management, presence handling, and reconnection patterns for Supabase Realtime
tags: [realtime, websockets, presence, live-updates, collaboration]
---

# Realtime Sync Specialist

## Overview

Realtime features create the illusion of instantaneity. Bad implementations create ghost users, duplicate messages, and memory leaks. WebSocket connections are expensive - manage them carefully.

**Core principle:** One channel per subscription, always clean up, throttle broadcasts. Realtime is powerful but easy to abuse.

## The Iron Law

```
NO REALTIME SUBSCRIPTION WITHOUT CLEANUP ON UNMOUNT
```

A subscription without cleanup leaks memory and connections. Multiple subscriptions to the same channel cause duplicate events. Always return a cleanup function from useEffect.

## When to Use

**Always:**
- Live updates (new posts, comments, messages)
- Presence indicators (who's online)
- Typing indicators
- Collaborative features (cursors, editing)
- Real-time notifications

**Don't:**
- Static content that rarely changes
- Data that only the current user modifies
- Initial page load (use Server Components)

Thinking "I'll just poll every second"? Stop. Polling at that frequency is worse than WebSocket. Use realtime or poll every 30+ seconds.

## The Process

### Step 1: Enable Realtime on Table

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Subscription with Cleanup

```tsx
useEffect(() => {
  const channel = supabase.channel('unique-name');
  channel.on(...).subscribe();
  return () => supabase.removeChannel(channel);
}, []);
```

### Step 3: Handle All Subscription States

Check for SUBSCRIBED, CHANNEL_ERROR, and TIMED_OUT states.

## Patterns

### Basic Realtime Subscription

<Good>
```tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useRealtimePosts(initialPosts: Post[]) {
  const [posts, setPosts] = useState(initialPosts);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on<Post>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload: RealtimePostgresChangesPayload<Post>) => {
          if (payload.eventType === 'INSERT') {
            setPosts((current) => [payload.new, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts((current) =>
              current.map((post) =>
                post.id === payload.new.id ? payload.new : post
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setPosts((current) =>
              current.filter((post) => post.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return posts;
}
```
Single channel, handles all event types, proper cleanup on unmount.
</Good>

<Bad>
```tsx
function Component() {
  useEffect(() => {
    const channel = supabase.channel('room');
    channel.subscribe();
    // No cleanup! Memory leak!
  });

  // Or worse - new channel every render
  useEffect(() => {
    supabase.channel('room').subscribe();
  }); // Missing dependency array = runs every render
}
```
No cleanup causes memory leaks. No dependency array creates new subscriptions on every render.
</Bad>

### Presence (Who's Online)

<Good>
```tsx
export function usePresence(roomId: string, currentUser: UserPresence) {
  const [users, setUsers] = useState<UserPresence[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: currentUser.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<UserPresence>();
        setUsers(Object.values(state).flat());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: currentUser.id,
            name: currentUser.name,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, currentUser.id]);

  return users;
}
```
Unique presence key, tracks on subscribe, untracks on cleanup.
</Good>

<Bad>
```tsx
// No presence key - conflicts with other users
const channel = supabase.channel('room');

// No untrack - ghost users remain after leaving
return () => {
  supabase.removeChannel(channel);
  // Missing channel.untrack()!
};
```
Missing presence key causes conflicts. Missing untrack creates ghost users.
</Bad>

### Broadcast with Throttling

<Good>
```tsx
import { useCallback, useRef } from 'react';
import { throttle } from 'lodash';

export function useLiveCursors(roomId: string, userId: string) {
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();

  useEffect(() => {
    const channel = supabase.channel(`cursors:${roomId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (payload.id !== userId) {
          setCursors((prev) => new Map(prev).set(payload.id, payload));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, userId]);

  // Throttle cursor updates to 60fps max
  const updateCursor = useCallback(
    throttle((x: number, y: number) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'cursor',
        payload: { id: userId, x, y },
      });
    }, 16),
    [userId]
  );

  return { cursors, updateCursor };
}
```
Throttles broadcasts to prevent overwhelming the channel. Uses ref to access channel in callback.
</Good>

<Bad>
```tsx
// Broadcasts on every mouse move - floods the channel
const handleMouseMove = (e) => {
  channel.send({
    type: 'broadcast',
    event: 'cursor',
    payload: { x: e.clientX, y: e.clientY },
  });
};
```
Broadcasting on every event floods the channel and causes lag.
</Bad>

### Reconnection Handling

<Good>
```tsx
useEffect(() => {
  const channel = supabase
    .channel('important-data')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'data' }, handleChange)
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to realtime');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Channel error:', err);
        // Could implement retry logic here
      } else if (status === 'TIMED_OUT') {
        console.error('Connection timed out');
      }
    });

  // Handle tab visibility for reconnection
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      channel.subscribe();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibility);
    supabase.removeChannel(channel);
  };
}, []);
```
Handles all subscription states, reconnects when tab becomes visible.
</Good>

<Bad>
```tsx
channel.subscribe(); // No status handling, silent failures
```
Ignoring subscription status means silent failures and stale data.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| No cleanup on unmount | Memory leaks, duplicate events | Always return cleanup function |
| Same channel name everywhere | Conflicts between components | Use unique channel names per context |
| Broadcasting every keystroke | Floods channel, causes lag | Throttle to 50-100ms minimum |
| Ignoring subscription status | Silent failures | Handle all status states |
| Creating channel in render | New subscription every render | Create in useEffect with deps |

## Red Flags - STOP

If you catch yourself:
- Writing useEffect without return cleanup
- Using the same channel name in multiple components
- Broadcasting without throttling
- Not handling CHANNEL_ERROR status
- Creating subscriptions without dependency array

**ALL of these mean: STOP. Add cleanup, unique names, and throttling.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "It's just one subscription" | One leak becomes many. Clean up every time. |
| "Throttling adds latency" | 16ms throttle is imperceptible. Flooding is noticeable. |
| "Users will refresh anyway" | Users keep tabs open for days. Leaks accumulate. |
| "The channel name is unique enough" | Add component ID or context to guarantee uniqueness. |
| "Reconnection is automatic" | Tab sleep disconnects. Handle visibility change. |
| "Errors are rare" | Network errors happen constantly. Handle them. |

## Gotchas

### RLS Applies to Realtime

If your RLS policy blocks SELECT, you won't receive realtime updates for that row. Test policies with realtime.

### Channel Names Must Be Unique Per Context

```tsx
// BAD - Same name in two components
supabase.channel('posts'); // Component A
supabase.channel('posts'); // Component B - conflicts!

// GOOD - Contextual names
supabase.channel(`posts:${userId}`);
supabase.channel(`posts:${roomId}`);
```

### Order Not Guaranteed

Realtime events may arrive out of order. Include timestamps and sort client-side if order matters.

### Presence Key Must Be Unique Per User

Each user needs a unique presence key. Using the same key shows only one user.

### Browsers Disconnect Sleeping Tabs

Implement visibility change handler to reconnect when tab becomes active.

## Verification Checklist

Before marking realtime feature complete:

- [ ] Realtime enabled on required tables (`ALTER PUBLICATION`)
- [ ] RLS allows SELECT for subscribed users
- [ ] Single channel per subscription (no duplicates)
- [ ] Cleanup function returns `removeChannel`
- [ ] Subscription status handling (SUBSCRIBED, ERROR, TIMED_OUT)
- [ ] Broadcast throttling for frequent updates
- [ ] Visibility change handler for tab sleep
- [ ] Unique channel names per context
- [ ] Presence has untrack on cleanup

Can't check all boxes? You have realtime issues. Fix them.

## Integration

**Pairs well with:**
- `supabase-backend` - Database setup and RLS
- `state-sync` - React Query invalidation on changes
- `react-patterns` - Custom hooks
- `server-client-boundary` - Client component placement

**Requires:**
- Supabase project with Realtime enabled
- Table added to `supabase_realtime` publication
- RLS policies that allow SELECT

## References

- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Supabase Presence](https://supabase.com/docs/guides/realtime/presence)
- [Supabase Broadcast](https://supabase.com/docs/guides/realtime/broadcast)

---

*This specialist follows the world-class skill pattern.*
