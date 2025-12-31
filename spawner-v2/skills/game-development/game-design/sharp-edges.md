# Game Development Sharp Edges

Critical mistakes in game development that cause performance issues, broken mechanics, or failed projects.

---

## 1. Frame Rate Ignorance

**The mistake**: Building game logic without considering frame rate independence. Using frame count instead of delta time for movement and physics.

**Why it happens**: Simpler to implement. "My machine runs fine." Don't understand the problem.

**Why it's devastating**: Game runs at different speeds on different devices. 60 FPS players move twice as fast as 30 FPS players. Physics becomes unpredictable. Multiplayer becomes impossible.

**The fix**: Always multiply movement and physics calculations by delta time. Test at different frame rates. Use fixed timestep for physics if needed. Never assume consistent frame rate.

---

## 2. Update Loop Bloat

**The mistake**: Putting expensive operations in the update/tick loop. Collision checks against every object. Pathfinding every frame. Creating new objects in update.

**Why it happens**: Update is where things happen. Easy to add logic there. Don't measure performance.

**Why it's devastating**: Frame rate tanks. Game becomes unplayable at scale. Mobile devices heat up and throttle. You've built something that only runs on developer machines.

**The fix**: Profile early and often. Use spatial partitioning for collision. Cache calculations. Spread expensive work across frames. Object pooling instead of allocation. Only update what changed.

---

## 3. State Machine Spaghetti

**The mistake**: Managing game state with scattered booleans and conditionals. `if (isJumping && !isDead && hasWeapon && !isMenuOpen && ...)`

**Why it happens**: Starts simple. "Just one more flag." Each feature adds conditions.

**Why it's devastating**: Impossible to reason about state. Bugs hide in edge cases. Adding features breaks existing behavior. State transitions become unpredictable.

**The fix**: Implement proper state machines. One source of truth for game state. Explicit state transitions. Finite states with clear entry/exit. State pattern for complex entities.

---

## 4. Input Handling Chaos

**The mistake**: Checking input scattered throughout the codebase. Different systems reading input independently. Raw input used directly for game actions.

**Why it happens**: Direct input checking seems natural. Quick to implement. "I'll organize it later."

**Why it's devastating**: Input conflicts between systems. Can't rebind controls. Can't handle different input devices. Input buffer and timing issues. Menu and gameplay fight for input.

**The fix**: Centralize input handling in an input manager. Abstract actions from raw input. Support input buffering. Handle input state, not just events. Clean separation between input reading and action execution.

---

## 5. Physics Tunneling

**The mistake**: Fast-moving objects passing through thin colliders. Bullet goes through wall. Player falls through floor when falling fast.

**Why it happens**: Discrete collision detection. Object moves too far between frames. Collision is never detected.

**Why it's devastating**: Bullets don't hit. Players escape levels. Core mechanics break at edge cases.

**The fix**: Use continuous collision detection for fast objects. Sweep testing for movement. Cap maximum velocity. Thicken colliders for thin surfaces. Ray cast ahead of movement.

---

## 6. Memory Leak Accumulation

**The mistake**: Not properly destroying/disposing game objects. Event listeners not removed. Textures not unloaded. References held after objects should be gone.

**Why it happens**: JavaScript/C# garbage collection "handles it." Forget cleanup. Don't notice during short play sessions.

**Why it's devastating**: Memory grows over time. Game crashes after extended play. Mobile runs out of memory. Performance degrades as session continues.

**The fix**: Object pooling for frequently created/destroyed objects. Explicit cleanup on destroy. Remove event listeners. Test long play sessions. Monitor memory in profiler.

---

## 7. Hardcoded Dependencies

**The mistake**: Systems tightly coupled with direct references. Player directly accesses enemy list. UI directly reads game state. Everything knows about everything.

**Why it happens**: Direct access is easy. Don't think about architecture upfront. "It's just a game."

**Why it's devastating**: Can't test in isolation. Changing one system breaks others. Can't add features without touching everything. Codebase becomes unmaintainable.

**The fix**: Event-driven communication. Dependency injection. Service locator pattern. Systems communicate through interfaces, not concrete types. Entity-component-system for complex games.

---

## 8. Asset Loading Freeze

**The mistake**: Loading all assets synchronously at startup. Blocking the main thread during load. No loading feedback.

**Why it happens**: Simpler to implement. Works on developer machine. Don't notice with few assets.

**Why it's devastating**: Long blank screen on startup. Browser may kill the tab. Players leave before game loads. Adding assets makes it worse.

**The fix**: Async asset loading. Show loading progress. Lazy load non-critical assets. Preload only what's needed for first scene. Background loading during gameplay.

---

## 9. Platform Assumption

**The mistake**: Building only for your development environment. Mouse-only controls for a touch game. No fallbacks for missing features.

**Why it happens**: Test on one device. Don't have other devices. "We'll handle that later."

**Why it's devastating**: Game doesn't work on target platform. Controls are wrong. Performance is terrible. You've built for yourself, not your players.

**The fix**: Test on target devices early. Abstract platform-specific code. Design for lowest common denominator. Handle different input methods. Performance budgets for target hardware.

---

## 10. Audio Disaster

**The mistake**: Not managing audio properly. Sounds pile up and distort. Music and effects fight for volume. Audio doesn't pause when game pauses.

**Why it happens**: Audio added last. "It's just sounds." Don't test with audio carefully.

**Why it's devastating**: Horrible audio experience. Volume spikes hurt players. Unprofessional feel. Audio continues during pause/menus.

**The fix**: Centralized audio management. Sound pooling with instance limits. Category volumes (music, sfx, UI). Audio responds to game state. Test audio mix deliberately.

---

## 11. Save System Afterthought

**The mistake**: Adding save/load after the game is built. Saving game state that's scattered across systems. Breaking saves with updates.

**Why it happens**: "We'll add saving later." Seems like a simple feature. Don't design for serialization.

**Why it's devastating**: Extremely difficult to retrofit. Can't save all necessary state. Saves break between versions. Players lose progress.

**The fix**: Design for serialization from the start. Centralized game state. Version your save format. Test save/load throughout development. Handle migration between save versions.

---

## 12. Scope Explosion

**The mistake**: Adding features without cutting others. "Just one more mechanic." Feature creep without time adjustment.

**Why it happens**: Ideas are exciting. Hard to say no. Don't want to disappoint. "We can do it."

**Why it's devastating**: Game never ships. Everything is half-done. Quality suffers. Team burns out. Project dies in development.

**The fix**: Ruthless scope management. MVP that's actually minimum. Cut features, not quality. Playable at every stage. Ship something smaller that's polished rather than something ambitious that's broken.
