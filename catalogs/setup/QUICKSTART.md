# Marketing Team Setup - 5 Minute Quickstart

Get your AI marketing team running in 5 minutes. Start simple, add tools as needed.

## TL;DR

1. Copy config to Claude Desktop
2. Add your API keys
3. Start creating

---

## Step 1: Choose Your Setup Level

### Level 1: Basic (Works Immediately)
**Tools:** Filesystem only
**What you can do:** Content planning, copywriting, strategy, reviews
**API keys needed:** None

### Level 2: Visual Creator (Recommended Start)
**Tools:** Filesystem + Midjourney/Fal.ai
**What you can do:** Everything above + AI image generation
**API keys needed:** 1 key

### Level 3: Full Creative Suite
**Tools:** All generation tools
**What you can do:** Images, videos, voice, music, avatars
**API keys needed:** 3-6 keys

**Start with Level 1 or 2. Add tools as you need them.**

---

## Step 2: Configure Claude Desktop

### Find your config file:
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### Copy this config:

```json
{
  "mcpServers": {
    "spawner": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.vibeship.co/mcp"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-filesystem", "/path/to/your/marketing-assets"]
    }
  }
}
```

**Change `/path/to/your/marketing-assets` to where you want to save generated content.**

Example paths:
- Mac: `/Users/yourname/Documents/Marketing`
- Windows: `C:/Users/yourname/Documents/Marketing`

### Restart Claude Desktop

That's it for Level 1! You can now use all marketing skills for planning and copywriting.

---

## Step 3: Add AI Generation Tools (Optional)

### Option A: Fal.ai (Easiest - One Key, Multiple Models)

Fal.ai gives you access to Flux, Stable Diffusion, video models, and more with one API key.

1. Go to [fal.ai](https://fal.ai)
2. Sign up and get your API key
3. Add to your config:

```json
{
  "mcpServers": {
    "spawner": { ... },
    "filesystem": { ... },
    "fal": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "FAL_KEY": "your-fal-api-key-here"
      }
    }
  }
}
```

### Option B: Individual Tools

See `tool-setup-guides/` for detailed setup of each tool:
- [Midjourney Setup](tool-setup-guides/midjourney.md)
- [Runway Setup](tool-setup-guides/runway.md)
- [ElevenLabs Setup](tool-setup-guides/elevenlabs.md)
- [Suno Setup](tool-setup-guides/suno.md)
- [HeyGen Setup](tool-setup-guides/heygen.md)

---

## Step 4: Verify Setup

Start a new Claude conversation and say:

```
Load the marketing team and verify my setup.
```

Claude will check which tools are available and confirm what you can create.

---

## Quick Reference: What Each Tool Enables

| Tool | What You Get | Monthly Cost |
|------|--------------|--------------|
| Filesystem | Save/read files, manage assets | Free |
| Fal.ai | Images (Flux), some video | ~$10-50 |
| Midjourney | Best image generation | $10-60 |
| Runway | Best video generation | $15-95 |
| ElevenLabs | Voice synthesis, SFX | $5-22 |
| Suno | AI music generation | $10-30 |
| HeyGen | AI avatar videos | $24-120 |

**Recommendation:** Start with Filesystem + Fal.ai. Add Runway for video, ElevenLabs for voice as needed.

---

## Common Issues

### "MCP server not found"
- Make sure you restarted Claude Desktop after editing config
- Check the config file path is correct for your OS

### "Permission denied" on filesystem
- Make sure the path exists
- Check you have write permissions to that folder

### "API key invalid"
- Double-check you copied the full key
- Make sure there are no extra spaces
- Check the key is active in the provider's dashboard

---

## Next Steps

Once setup is complete:

1. **Load a skill:** "Load the copywriting skill"
2. **Start a workflow:** "Let's run a social content workflow for my product launch"
3. **Generate content:** "Create 5 Instagram post variations for..."

See `marketing-playbooks.json` for complete workflow examples.

---

## Need Help?

- Check the [tool setup guides](tool-setup-guides/) for detailed instructions
- Review [marketing-agents.json](../marketing-agents.json) for agent capabilities
- See [sample-campaign-product-launch.json](../examples/sample-campaign-product-launch.json) for a complete example
