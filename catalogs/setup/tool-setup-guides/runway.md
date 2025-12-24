# Runway Setup Guide

**Best for:** AI video generation, image-to-video, motion graphics

## Why Runway?

- **Best video generation:** Gen-3 Alpha Turbo is industry-leading
- **Image-to-video:** Animate any still image
- **Motion control:** Specify camera movements and actions
- **Professional quality:** Broadcast-ready output

## Cost

- **No free tier:** Requires subscription
- **Standard ($15/mo):** 125 credits (about 25 five-second videos)
- **Pro ($35/mo):** 450 credits
- **Unlimited ($95/mo):** Unlimited generations
- **Typical usage:** Standard for testing, Pro for production

## Setup Steps

### 1. Create Account

1. Go to [runwayml.com](https://runwayml.com)
2. Click "Get Started"
3. Sign up and choose a plan

### 2. Get API Key

1. Go to [app.runwayml.com/settings/api](https://app.runwayml.com/settings/api)
2. Click "Create API Key"
3. Copy the key

### 3. Add to Claude Desktop

```json
{
  "mcpServers": {
    "runway": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "RUNWAY_API_KEY": "your_key_here"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

## Generation Options

| Feature | Credits | Duration |
|---------|---------|----------|
| Gen-3 Alpha Turbo (5s) | 5 | 5 seconds |
| Gen-3 Alpha Turbo (10s) | 10 | 10 seconds |
| Image-to-Video | 5 | 5 seconds |

**Aspect Ratios:** 16:9 (landscape), 9:16 (vertical), 1:1 (square)

## Prompt Best Practices

### Specify Camera Movement
```
Camera slowly dollying forward through a modern office space,
warm natural lighting, morning atmosphere
```

### Describe Action Clearly
```
A hand reaching for a coffee cup on a wooden desk,
smooth motion, shallow depth of field, lifestyle commercial
```

### Include Style References
```
Product rotating 360 degrees, studio lighting with rim light,
particles floating, premium commercial aesthetic, 4K quality
```

## Example Usage

```
Generate a Runway video:

"Sleek smartphone slowly rotating against deep black gradient,
smooth 360 spin, studio lighting with dramatic rim light,
particles floating in air, cinematic product commercial"

5 seconds, 16:9 aspect ratio
```

## Image-to-Video Workflow

Best results come from animating a Midjourney/Fal.ai image:

1. Generate still image with Midjourney
2. Use Runway to animate it
3. Result is more controlled than text-to-video

```
Take this product hero image and animate it:
- Subtle particle movement in background
- Slight product rotation
- Camera slowly pushing in
```

## Troubleshooting

### "Insufficient credits"
- Check credits at app.runwayml.com
- Upgrade plan or wait for monthly refresh

### Video quality issues
- Add more detail to prompts
- Use image-to-video for more control
- Try multiple generations and select best

### Content moderation
- Runway has content policies
- Avoid violent, adult, or copyrighted content references
