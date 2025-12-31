# Game Development Patterns

Proven approaches for building games that are fun, performant, and maintainable.

---

## 1. Core Loop First

**The pattern**: Build and polish the central gameplay loop before adding any other features.

**How it works**:
1. Identify the core mechanic (what the player does most often)
2. Build the minimal version of that mechanic
3. Playtest until it feels good
4. Add juice (feedback, effects, sound)
5. Only then add supporting systems

**Why it works**: Games succeed or fail on their core loop. If the fundamental action isn't fun, no amount of features will save it. By validating core gameplay first, you fail fast on bad ideas and invest deeply in good ones.

**Indicators for use**: Starting any new game project. Evaluating a game concept. Deciding where to focus polish.

---

## 2. Entity-Component-System (ECS)

**The pattern**: Separate game objects into entities (identity), components (data), and systems (behavior).

**How it works**:
1. Entities are just IDs (no logic)
2. Components are pure data (Position, Health, Renderable)
3. Systems operate on entities with specific component combinations
4. Composition over inheritance—mix and match capabilities

**Example**:
```
Entity: 42
Components: Position{x, y}, Sprite{texture}, Health{current, max}
Systems: RenderSystem (entities with Position + Sprite)
         DamageSystem (entities with Health)
```

**Why it works**: Avoids deep inheritance hierarchies. Easy to create new entity types by combining components. Systems can be optimized for cache efficiency. Scales to complex games with many entity types.

**Indicators for use**: Games with many different entity types. Need for flexible entity composition. Performance-critical games with many entities.

---

## 3. Object Pooling

**The pattern**: Pre-allocate objects and reuse them instead of creating/destroying.

**How it works**:
1. Create a pool of objects at startup (bullets, particles, enemies)
2. When needed, take from pool and reset state
3. When done, return to pool instead of destroying
4. Pool grows if needed, shrinks during low usage

**Why it works**: Eliminates allocation/GC during gameplay. Consistent memory footprint. Eliminates frame spikes from garbage collection. Essential for any game with frequent object creation.

**Indicators for use**: Bullets, particles, spawned enemies, any frequently created/destroyed object. Mobile games. Web games. Any game where frame consistency matters.

---

## 4. State Machine Pattern

**The pattern**: Model entity behavior as explicit states with defined transitions.

**How it works**:
1. Define discrete states (Idle, Walking, Jumping, Attacking, Dead)
2. Each state handles its own update/input logic
3. Define valid transitions between states
4. State changes go through transition logic

**Why it works**: Makes behavior predictable and debuggable. Impossible to be in multiple conflicting states. Easy to add new states without breaking existing ones. Clear entry/exit points for effects and sound.

**Indicators for use**: Player character behavior. Enemy AI. Game phases (menu, playing, paused). Any entity with distinct behavioral modes.

---

## 5. Spatial Partitioning

**The pattern**: Divide game space into regions to optimize queries.

**How it works**:
1. Partition space into cells (grid, quadtree, octree)
2. Track which entities are in which cells
3. For collision/proximity checks, only check entities in nearby cells
4. Update cell membership when entities move

**Types**:
- **Grid**: Simple, fixed-size cells, good for uniform distribution
- **Quadtree**: Adaptive subdivision, good for clustered objects
- **Spatial hash**: Hash-based lookup, good for dynamic scenes

**Why it works**: Reduces O(n²) collision checks to O(n) or better. Essential for any game with many entities. Scales to thousands of objects.

**Indicators for use**: Many entities needing collision detection. Large game worlds. Performance problems with naive collision.

---

## 6. Delta Time Movement

**The pattern**: Base all movement and time-based calculations on elapsed time, not frames.

**How it works**:
1. Calculate delta time each frame (time since last frame)
2. Multiply all velocities by delta time
3. Timer countdowns subtract delta time
4. Physics uses delta time or fixed timestep

```javascript
// Wrong
position.x += speed;

// Right
position.x += speed * deltaTime;
```

**Why it works**: Game runs consistently across different frame rates. 30 FPS and 60 FPS players have same experience. Essential for any cross-platform or web game where frame rate varies.

**Indicators for use**: Always. Every game. No exceptions.

---

## 7. Game Feel / Juice System

**The pattern**: Add layers of feedback to make actions feel satisfying.

**How it works**:
1. Identify key player actions (jump, attack, collect)
2. Add multiple feedback layers:
   - Visual: Particles, screen shake, flash, stretch/squash
   - Audio: Sound effects, pitch variation
   - Animation: Anticipation, action, recovery
   - Camera: Zoom, shake, focus
3. Make feedback instant and snappy
4. Layer effects for intensity

**Why it works**: The difference between a game that feels good and one that feels flat. Players may not consciously notice juice, but they feel its absence. Juice makes simple mechanics engaging.

**Indicators for use**: Any game with player actions. Polish phase. When gameplay feels "off" but mechanics work correctly.

---

## 8. Scene/Level Management

**The pattern**: Organize game content into discrete scenes with clear lifecycle.

**How it works**:
1. Define scenes (Menu, Gameplay, Pause, GameOver)
2. Each scene has init, update, render, cleanup methods
3. Scene manager handles transitions and active scene
4. Scenes don't know about each other—manager mediates

**Why it works**: Clean separation of concerns. Easy to add new scenes. Clear resource management (load on init, unload on cleanup). Enables loading screens between heavy scenes.

**Indicators for use**: Any game with multiple screens. Menu systems. Level progression. Games complex enough to need organization.

---

## 9. Event-Driven Communication

**The pattern**: Use events/signals for system communication instead of direct references.

**How it works**:
1. Define game events (EnemyDied, PlayerScored, LevelComplete)
2. Systems subscribe to events they care about
3. Systems emit events when things happen
4. No direct coupling between systems

**Example**:
```javascript
// Enemy system emits when enemy dies
events.emit('enemyDied', {enemy, position, type});

// Score system listens
events.on('enemyDied', (data) => score += getPoints(data.type));

// Particle system listens
events.on('enemyDied', (data) => spawnExplosion(data.position));
```

**Why it works**: Loose coupling between systems. Easy to add new listeners without modifying emitters. Debug by logging events. Systems can be developed independently.

**Indicators for use**: Multiple systems that need to react to the same events. Growing codebase. Multiple developers. Any game complex enough that direct coupling creates problems.

---

## 10. Configuration-Driven Design

**The pattern**: Drive game behavior from data files, not code.

**How it works**:
1. Externalize game constants (health, speed, damage)
2. Define entities in data (JSON, YAML)
3. Level layouts in data (Tiled maps, etc.)
4. Load and parse config at runtime

**Why it works**: Tune without recompiling. Designers can modify without code access. Easy A/B testing. Modding support. Clear separation of logic and content.

**Indicators for use**: Games with many tunable values. Teams with designers. Need for rapid iteration. Games that will be updated post-launch.
