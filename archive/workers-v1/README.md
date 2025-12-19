# Archived: Workers V1

This is the original monolithic MCP worker implementation (1491 lines in single file).

**Superseded by:** `spawner-v2/` - modular implementation with D1, KV, and proper tool structure.

## Why Archived

- V1 was a single-file monolith
- V2 has modular tool structure (`src/tools/`)
- V2 has D1 database for persistence
- V2 has KV for skills and sharp edges
- V2 has proper MCP protocol implementation

## Do Not Use

This code is preserved for reference only. Use `spawner-v2/` for all development.
