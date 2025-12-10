# vibeship-crew

MCP server for vibeship crew - scaffold AI-powered projects directly from Claude.

## Installation

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "vibeship-crew": {
      "command": "node",
      "args": ["C:/path/to/vibeship-crew/mcp/src/index.js"]
    }
  }
}
```

Or if published to npm:

```json
{
  "mcpServers": {
    "vibeship-crew": {
      "command": "npx",
      "args": ["vibeship-crew"]
    }
  }
}
```

## Tools

### create_project

Create a new vibeship crew project.

**Parameters:**
- `gist_id` - GitHub Gist ID from vibeship web configurator
- `template` - Template name (saas, marketplace, ai-app, web3, tool)
- `project_name` - Project name (required with template)
- `target_dir` - Target directory (optional)
- `agents` - Override template agents (optional)
- `mcps` - Override template MCPs (optional)

**Examples:**

From gist:
```
create_project with gist_id="abc123"
```

From template:
```
create_project with template="saas" and project_name="my-app"
```

### check_environment

Check if required dependencies are installed (Node.js 18+, Claude CLI, git).

### list_templates

List available project templates with their agents and MCPs.

## Usage Flow

1. User configures stack at vibeship.dev (or picks a template)
2. User tells Claude: "create project from gist abc123" or "create a saas project called my-app"
3. Claude uses this MCP to scaffold the project
4. Project is ready with CLAUDE.md, state files, and skill files
