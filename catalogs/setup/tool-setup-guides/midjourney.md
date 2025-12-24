# Midjourney Setup Guide

**Best for:** Highest quality AI image generation, creative visuals, marketing imagery

## Why Midjourney?

- **Best image quality:** Industry-leading visual output
- **Artistic control:** Extensive style and parameter options
- **Consistent results:** v6.1 produces reliable, professional images
- **Strong community:** Huge prompt library and examples

## Cost

- **No free tier:** Requires subscription
- **Basic ($10/mo):** ~200 images/month
- **Standard ($30/mo):** ~900 images/month
- **Pro ($60/mo):** ~1800 images/month
- **Typical usage:** Standard for regular marketing work

## Current API Status

**Note:** Midjourney's official API is limited access. Options:

1. **Discord bot:** Native interface, most reliable
2. **Third-party APIs:** useapi.net, imagineapi.dev (paid services)
3. **Web interface:** New alpha web app at midjourney.com

## Option A: Discord Workflow (Recommended)

### 1. Create Account
1. Go to [midjourney.com](https://midjourney.com)
2. Sign in with Discord
3. Subscribe to a plan

### 2. Use in Discord
1. Join Midjourney Discord or add bot to your server
2. Use `/imagine` command with prompts
3. Download generated images

### 3. Add to Project
Save images to your marketing assets folder.

## Option B: Third-Party API

### Using useapi.net

1. Sign up at [useapi.net](https://useapi.net)
2. Get API key
3. Configure:

```json
{
  "mcpServers": {
    "midjourney": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "USEAPI_TOKEN": "your_token",
        "USEAPI_DISCORD": "your_discord_token"
      }
    }
  }
}
```

**Note:** Third-party services add cost and may have reliability issues.

## Prompt Structure

```
[subject] [action/pose] [environment] [style] [lighting] [camera]
--ar [ratio] --s [stylize] --v 6.1
```

## Key Parameters

| Parameter | Effect | Example |
|-----------|--------|---------|
| --ar | Aspect ratio | --ar 16:9, --ar 1:1 |
| --s | Stylization (0-1000) | --s 150 (default 100) |
| --v | Version | --v 6.1 |
| --style raw | Less stylized, more photo-real | --style raw |
| --no | Exclude elements | --no text, watermark |
| --c | Chaos/variation (0-100) | --c 20 |

## Marketing Templates

### Product Hero
```
premium wireless headphones matte black,
product photography, centered composition,
soft studio lighting, gradient background deep purple,
clean minimal aesthetic, 8K detail, commercial photography
--ar 16:9 --s 150 --v 6.1
```

### Lifestyle Scene
```
young professional using laptop in modern coffee shop,
candid moment, natural lighting, warm tones,
lifestyle photography, shallow depth of field
--ar 4:5 --s 100 --v 6.1
```

### Social Graphic
```
abstract rocket launching, flat geometric illustration,
bold orange and purple, dynamic composition,
modern graphic design, trending on behance
--ar 1:1 --s 200 --v 6.1
```

### Professional Avatar
```
professional portrait, friendly confident expression,
soft gray studio background, soft diffused lighting,
high-end corporate photography, 85mm lens
--ar 1:1 --s 50 --style raw --v 6.1
```

## Power User Tips

### Prompt Weighting
Use `::` to weight elements:
```
rocket::2 space::1 stars::0.5
```
Higher number = more emphasis

### Style Stacking
Chain styles for unique looks:
```
product photography, editorial, vogue magazine, minimal
```

### Camera References
Add realism:
```
shot on Canon 5D, 85mm lens, f/1.8
```

## Example Usage with Claude

```
Create a Midjourney prompt for a SaaS product hero image:
- Product: Productivity app dashboard
- Style: Clean, modern, tech
- Colors: Purple and teal gradient
- Aspect: 16:9 for website header

I'll generate in Midjourney and save to /marketing-assets/images/
```

Claude provides optimized prompt. You generate and save.

## Troubleshooting

### Images too stylized
- Lower --s value (try 50-100)
- Add --style raw for photos

### Wrong aspect ratio
- Always specify --ar
- Check you're using correct format (16:9 not 16x9)

### Unwanted elements appearing
- Use --no to exclude: `--no text, watermark, people`
- Be specific about what you want
