# Fal.ai Setup Guide

**Best for:** Getting started quickly with multiple AI models using one API key

## Why Fal.ai?

- **One key, many models:** Access Flux Pro, Flux Schnell, SDXL, video models, and more
- **Pay per use:** No subscription, just pay for what you generate
- **Fast:** Optimized infrastructure, quick generation times
- **Easy API:** Simple REST API, works with fetch MCP

## Cost

- **Free tier:** Limited generations to try it out
- **Pay as you go:** ~$0.01-0.10 per image depending on model
- **Typical usage:** $10-50/month for active marketing work

## Setup Steps

### 1. Create Account

1. Go to [fal.ai](https://fal.ai)
2. Click "Get Started" or "Sign Up"
3. Sign up with Google/GitHub or email

### 2. Get API Key

1. Go to [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
2. Click "Create Key"
3. Name it something like "Marketing Team"
4. Copy the key (starts with `fal_...`)

### 3. Add to Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fal": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "FAL_KEY": "fal_your_key_here"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

Close and reopen Claude Desktop to load the new config.

## Available Models

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| flux-pro | High quality images | Medium | ~$0.05 |
| flux-schnell | Fast iterations | Fast | ~$0.01 |
| stable-diffusion-xl | Good all-rounder | Medium | ~$0.02 |
| stable-video-diffusion | Image to video | Slow | ~$0.10 |

## Example Usage

Once configured, tell Claude:

```
Using Fal.ai, generate a product hero image:
"Premium wireless headphones on gradient purple background,
product photography, studio lighting, 16:9 aspect ratio"
```

Claude will use the Fal.ai API to generate the image.

## Troubleshooting

### "Invalid API key"
- Check you copied the full key including `fal_` prefix
- Verify the key is active in your Fal dashboard

### "Rate limited"
- Fal has generous limits, but slow down if hitting them
- Check your usage in the dashboard

### "Model not found"
- Model names are case-sensitive
- Check [fal.ai/models](https://fal.ai/models) for exact names
