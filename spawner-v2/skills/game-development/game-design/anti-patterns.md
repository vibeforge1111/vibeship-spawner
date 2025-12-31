# Game Development Anti-Patterns

Approaches that seem reasonable in game development but lead to unmaintainable code, poor performance, or failed projects.

---

## 1. The God Object

**What it looks like**: One massive class that controls everything—GameManager with 3000 lines that handles player, enemies, UI, score, levels, audio, and saving.

**Why it seems good**: Everything in one place. Easy to find. "I know where the code is."

**Why it fails**: Impossible to modify without breaking other things. Can't test in isolation. Multiple developers can't work simultaneously. Merge conflicts constantly. Eventually becomes untouchable.

**What to do instead**: Single responsibility. Separate managers for separate concerns. Systems communicate through events, not direct access. Code should be boring and predictable, not clever and comprehensive.

---

## 2. Premature Engine Building

**What it looks like**: Spending months building a "reusable game engine" before making any actual game. Entity systems, rendering abstraction, plugin architecture—all before a prototype.

**Why it seems good**: Will save time on future games. Proper architecture. Professional approach.

**Why it fails**: You don't know what you need until you build a game. Your engine solves imaginary problems. Meanwhile, you haven't shipped anything. Proven engines exist—use them.

**What to do instead**: Use an existing engine (Phaser, Unity, Godot). Extract reusable code after you've needed it twice. Build games, not engines.

---

## 3. Deep Inheritance Hierarchies

**What it looks like**: `Enemy extends Character extends Entity extends GameObject extends MonoBehaviour`, with each level adding a few methods.

**Why it seems good**: OOP best practices. Code reuse. Logical organization.

**Why it fails**: Diamond problem. Brittle hierarchies that break when requirements change. Methods in the wrong level. Can't mix and match capabilities. "Is a FlyingEnemy a Character or a Flying thing?"

**What to do instead**: Composition over inheritance. Entity-Component-System. Mix capabilities through components, not class hierarchy. Inherit for true "is-a" only.

---

## 4. Update Everything Always

**What it looks like**: Every entity runs full update logic every frame, regardless of relevance. All enemies pathfind every frame. All projectiles check all collisions.

**Why it seems good**: Simple and correct. Everything stays in sync.

**Why it fails**: Massive performance waste. Frame rate tanks with entity count. O(n²) problems hide until you have enough entities.

**What to do instead**: Spatial partitioning. Only update visible/nearby entities. Spread work across frames. Dirty flags—only recalculate what changed. LOD for update frequency.

---

## 5. String-Based Identification

**What it looks like**: `if (collision.tag === "Enemy")`, `GetComponent("PlayerHealth")`, event systems with string keys everywhere.

**Why it seems good**: Flexible. Easy to add new types. Don't need to define enums.

**Why it fails**: Typos cause silent bugs. No autocomplete or type checking. Refactoring is dangerous. "Enenmy" won't throw an error, just won't work.

**What to do instead**: Enums, constants, or type-safe identifiers. Let the compiler catch mistakes. String-based systems only where truly necessary (config files, modding).

---

## 6. Frame-Dependent Logic

**What it looks like**: Assuming 60 FPS everywhere. `position += 5` instead of `position += speed * deltaTime`. Cooldowns counted in frames.

**Why it seems good**: Simpler math. Works on your machine. Classic game development approach.

**Why it fails**: Different speeds on different hardware. Mobile runs at 30 FPS, PC at 144. Web browsers throttle background tabs. Game speed varies with performance.

**What to do instead**: Always use delta time. Time-based cooldowns and timers. Fixed timestep for physics if frame-independence is hard. Test at different frame rates.

---

## 7. Callback Hell

**What it looks like**: Deeply nested callbacks for sequences—tween → callback → spawn → callback → delay → callback → animation → callback.

**Why it seems good**: Each step triggers the next. Logic is co-located.

**Why it fails**: Impossible to follow. Can't cancel mid-sequence. Error handling is a mess. Debugging is nightmare. "Where does this callback come from?"

**What to do instead**: Coroutines/generators for sequences. State machines for complex flows. Tweening libraries with promise-like chaining. Finite sequence managers.

---

## 8. Magic Numbers Everywhere

**What it looks like**: `velocity.y += 9.8`, `if (health > 100)`, `setPosition(350, 200)`. Numbers scattered throughout code.

**Why it seems good**: Fast to write. "I know what 9.8 means."

**Why it fails**: Can't tune from one place. Inconsistent values when duplicated. No context for future readers. Can't configure for different difficulty levels.

**What to do instead**: Named constants. Configuration objects. Data-driven settings. Even `GRAVITY = 9.8` is better than raw 9.8.

---

## 9. Testing in Production Only

**What it looks like**: No automated tests. No debug tools. Testing means playing the game manually. "We'll find bugs when we see them."

**Why it seems good**: Games are interactive—can't test them automatically. Writing tests slows development.

**Why it fails**: Regression bugs accumulate. Edge cases never get tested. Developers waste time reproducing issues. Problems found late are expensive to fix.

**What to do instead**: Unit test game logic (damage calculation, inventory, state machines). Integration tests for critical systems. Debug tools for visualization. Automated playtesting for balance.

---

## 10. Premature Optimization

**What it looks like**: Hand-optimizing code before profiling. "I'm using arrays instead of objects for performance." Complex data structures for simple games.

**Why it seems good**: Performance matters in games. Thinking ahead. Being professional.

**Why it fails**: Optimizing the wrong things. Making code complex for no measured benefit. Spending time on microseconds while milliseconds burn elsewhere.

**What to do instead**: Profile first. Optimize measured bottlenecks. Simple code until proven slow. The hot path is usually obvious—focus there.

---

## 11. Ignoring Mobile/Low-End

**What it looks like**: Developing on gaming PC, targeting all platforms. Testing only on development machine. "It runs fine for me."

**Why it seems good**: Development is faster on good hardware. You can test later.

**Why it fails**: Discover performance problems late. Architecture isn't suitable for constraints. Mobile has different input, different performance, different expectations. Retrofitting is painful.

**What to do instead**: Test on target hardware early. Budget for lowest target. Design controls for all input methods. Performance testing on real devices, not dev machines.

---

## 12. Feature Complete, Fun Absent

**What it looks like**: All planned features implemented. Complex systems working. But it's not fun to play. "We just need to add more content."

**Why it seems good**: You delivered what was planned. The checklist is complete.

**Why it fails**: Fun isn't a feature you add at the end. If the core loop isn't fun, more features don't help. You've built something nobody wants to play.

**What to do instead**: Core loop first. Playtest constantly. Cut features that don't serve fun. Polish the core rather than expanding scope. Fun first, features second.
