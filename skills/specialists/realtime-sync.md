# Realtime Sync Specialist

## Identity

- **Tags**: `realtime`, `websockets`, `presence`, `live-updates`, `collaboration`
- **Domain**: Supabase Realtime, presence, broadcast, live cursors, collaborative features
- **Use when**: Live updates, multiplayer features, notifications, typing indicators

---

## Patterns

### Enable Realtime on Table

```sql
-- Enable realtime for a table
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Or enable for specific columns only
ALTER PUBLICATION supabase_realtime ADD TABLE posts (id, title, status);

-- Enable RLS (required for realtime with auth)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

### Basic Realtime Subscription

```tsx
// hooks/use-realtime-posts.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useRealtimePosts(initialPosts: Post[]) {
  const [posts, setPosts] = useState(initialPosts);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on<Post>(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'posts',
        },
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

// Usage in component
export function PostsList({ initialPosts }: { initialPosts: Post[] }) {
  const posts = useRealtimePosts(initialPosts);

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Filtered Realtime Subscription

```tsx
// Only subscribe to posts by specific user
useEffect(() => {
  const channel = supabase
    .channel('user-posts')
    .on<Post>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `user_id=eq.${userId}`, // Filter server-side
      },
      handleChange
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [supabase, userId]);
```

### Presence (Who's Online)

```tsx
// hooks/use-presence.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimePresenceState } from '@supabase/supabase-js';

interface UserPresence {
  id: string;
  name: string;
  avatar?: string;
  online_at: string;
}

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
        const presentUsers = Object.values(state).flat();
        setUsers(presentUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, currentUser]);

  return users;
}

// Usage
function RoomHeader({ roomId, user }) {
  const onlineUsers = usePresence(roomId, user);

  return (
    <div className="flex items-center gap-2">
      {onlineUsers.map((u) => (
        <div key={u.id} className="relative">
          <img src={u.avatar} className="w-8 h-8 rounded-full" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </div>
      ))}
      <span className="text-sm text-gray-500">
        {onlineUsers.length} online
      </span>
    </div>
  );
}
```

### Broadcast (Custom Events)

```tsx
// hooks/use-broadcast.ts
'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface BroadcastPayload {
  type: string;
  data: unknown;
}

export function useBroadcast<T>(
  channelName: string,
  eventName: string,
  onMessage: (data: T) => void
) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: eventName }, ({ payload }) => {
        onMessage(payload as T);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, channelName, eventName, onMessage]);

  const send = useCallback(
    async (data: T) => {
      const channel = supabase.channel(channelName);
      await channel.send({
        type: 'broadcast',
        event: eventName,
        payload: data,
      });
    },
    [supabase, channelName, eventName]
  );

  return { send };
}

// Usage - Typing indicator
function ChatInput({ roomId, userId }) {
  const { send } = useBroadcast(`room:${roomId}`, 'typing', () => {});

  const handleTyping = () => {
    send({ userId, typing: true });
  };

  return (
    <input
      onChange={handleTyping}
      placeholder="Type a message..."
    />
  );
}
```

### Typing Indicator

```tsx
// hooks/use-typing-indicator.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TypingUser {
  id: string;
  name: string;
}

export function useTypingIndicator(roomId: string, currentUser: TypingUser) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const supabase = createClient();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();

  useEffect(() => {
    const channel = supabase.channel(`typing:${roomId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { user, isTyping } = payload as { user: TypingUser; isTyping: boolean };

        if (user.id === currentUser.id) return;

        setTypingUsers((current) => {
          if (isTyping) {
            if (current.find((u) => u.id === user.id)) return current;
            return [...current, user];
          } else {
            return current.filter((u) => u.id !== user.id);
          }
        });

        // Auto-remove after 3 seconds
        setTimeout(() => {
          setTypingUsers((current) =>
            current.filter((u) => u.id !== user.id)
          );
        }, 3000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, currentUser.id]);

  const startTyping = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user: currentUser, isTyping: true },
    });

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    timeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user: currentUser, isTyping: false },
      });
    }, 2000);
  }, [currentUser]);

  return { typingUsers, startTyping };
}

// Usage
function TypingIndicator({ roomId, user }) {
  const { typingUsers } = useTypingIndicator(roomId, user);

  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.name);
  const text =
    names.length === 1
      ? `${names[0]} is typing...`
      : `${names.slice(0, -1).join(', ')} and ${names.slice(-1)} are typing...`;

  return <p className="text-sm text-gray-500 animate-pulse">{text}</p>;
}
```

### Live Cursors

```tsx
// hooks/use-live-cursors.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CursorPosition {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export function useLiveCursors(roomId: string, userId: string, userName: string) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();
  const color = useRef(`hsl(${Math.random() * 360}, 70%, 50%)`);

  useEffect(() => {
    const channel = supabase.channel(`cursors:${roomId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        const cursor = payload as CursorPosition;
        if (cursor.id === userId) return;

        setCursors((current) => {
          const next = new Map(current);
          next.set(cursor.id, cursor);
          return next;
        });
      })
      .on('broadcast', { event: 'cursor-leave' }, ({ payload }) => {
        const { id } = payload as { id: string };
        setCursors((current) => {
          const next = new Map(current);
          next.delete(id);
          return next;
        });
      })
      .subscribe();

    return () => {
      channel.send({
        type: 'broadcast',
        event: 'cursor-leave',
        payload: { id: userId },
      });
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, userId]);

  const updateCursor = useCallback(
    (x: number, y: number) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          id: userId,
          name: userName,
          color: color.current,
          x,
          y,
        },
      });
    },
    [userId, userName]
  );

  return { cursors: Array.from(cursors.values()), updateCursor };
}

// Usage
function CollaborativeCanvas({ roomId, user }) {
  const { cursors, updateCursor } = useLiveCursors(roomId, user.id, user.name);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    updateCursor(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div onMouseMove={handleMouseMove} className="relative w-full h-full">
      {/* Your canvas content */}

      {/* Other users' cursors */}
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute pointer-events-none transition-all duration-75"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={cursor.color}
          >
            <path d="M5.5 3.21V20.8L11.46 14.82H19.11L5.5 3.21Z" />
          </svg>
          <span
            className="text-xs px-1 rounded"
            style={{ backgroundColor: cursor.color, color: 'white' }}
          >
            {cursor.name}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### React Query Integration

```tsx
// Invalidate React Query on realtime updates
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeInvalidation(
  table: string,
  queryKey: string[]
) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-invalidation`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          // Invalidate queries when data changes
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, queryKey, queryClient]);
}

// Usage
function PostsPage() {
  useRealtimeInvalidation('posts', ['posts']);
  const { data: posts } = usePosts();
  // ...
}
```

---

## Anti-patterns

### Creating Multiple Channels

```typescript
// BAD - New channel every render
function Component() {
  useEffect(() => {
    const channel = supabase.channel('room'); // Created every render!
    channel.subscribe();
  });
}

// GOOD - Single channel with cleanup
function Component() {
  useEffect(() => {
    const channel = supabase.channel('room');
    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, []); // Empty deps + cleanup
}
```

### Not Handling Reconnection

```typescript
// GOOD - Handle subscription states
channel.subscribe((status, err) => {
  if (status === 'SUBSCRIBED') {
    console.log('Connected');
  } else if (status === 'CHANNEL_ERROR') {
    console.error('Connection error:', err);
    // Implement retry logic
  } else if (status === 'TIMED_OUT') {
    console.error('Connection timed out');
  }
});
```

### Over-Broadcasting

```typescript
// BAD - Broadcast every character
const handleChange = (e) => {
  broadcast({ text: e.target.value });
};

// GOOD - Throttle/debounce
const handleChange = useCallback(
  throttle((text) => {
    broadcast({ text });
  }, 100),
  []
);
```

---

## Gotchas

### 1. RLS Applies to Realtime

If RLS blocks SELECT, you won't receive realtime updates for that row.

### 2. Channel Names Must Be Unique

Using the same channel name in multiple components can cause issues. Use unique prefixes.

### 3. Presence Key Must Be Unique

Each user needs a unique presence key per channel.

### 4. Reconnection After Tab Sleep

Browsers may disconnect WebSocket when tab is inactive. Handle reconnection:
```typescript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Re-subscribe to channels
  }
});
```

### 5. Order Not Guaranteed

Realtime events may arrive out of order. Use timestamps for ordering if needed.

---

## Checkpoints

Before marking realtime feature complete:

- [ ] Realtime enabled on required tables
- [ ] RLS allows SELECT for subscribed users
- [ ] Single channel per subscription
- [ ] Proper cleanup on unmount
- [ ] Reconnection handling
- [ ] Optimistic updates for user's own actions
- [ ] Throttling for frequent updates
- [ ] Error handling for subscription failures

---

## Squad Dependencies

Often paired with:
- `supabase-backend` for database setup
- `state-sync` for React Query integration
- `react-patterns` for hooks
- `crud-builder` for data operations

---

*Last updated: 2025-12-11*
