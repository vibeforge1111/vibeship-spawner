# HeyGen Setup Guide

**Best for:** AI avatar videos, talking head presentations, personalized videos at scale

## Why HeyGen?

- **Realistic AI avatars:** Professional presenters without filming
- **Custom avatars:** Create a digital twin of yourself or team
- **Personalization at scale:** Generate hundreds of personalized videos
- **Multi-language:** Translate and lip-sync to 40+ languages

## Cost

- **Free trial:** 1 minute of video
- **Creator ($24/mo):** 15 minutes/month
- **Business ($120/mo):** 60 minutes/month, custom avatars
- **Typical usage:** Creator for occasional videos, Business for campaigns

## Setup Steps

### 1. Create Account

1. Go to [heygen.com](https://heygen.com)
2. Click "Get Started Free"
3. Sign up with email or Google

### 2. Get API Key

1. Go to [app.heygen.com/settings/api](https://app.heygen.com/settings/api)
2. Copy your API key

### 3. Add to Claude Desktop

```json
{
  "mcpServers": {
    "heygen": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "HEYGEN_API_KEY": "your_key_here"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

## Avatar Options

### Stock Avatars
- 100+ professional presenters
- Various ethnicities, ages, styles
- Business casual to formal

### Custom Avatars (Business+)
- Upload 2-minute video of yourself
- AI creates your digital twin
- Speak in any language

### Instant Avatars
- Generate from single photo
- Quick but less realistic
- Good for testing

## Example Usage

```
Create a HeyGen video:

Avatar: Professional woman, business casual
Background: Modern office

Script:
"Hi [name], I noticed your company is expanding into new markets.
I wanted to personally share how FlowState has helped similar
companies increase productivity by 40%.

Let's schedule a quick call this week to discuss how we can
help [company] achieve the same results."

Use a warm, conversational tone.
```

## Personalization Variables

HeyGen supports variables for personalized videos:

- `{name}` - Recipient's name
- `{company}` - Company name
- `{custom_1}` - Any custom field

Upload a CSV to generate hundreds of personalized videos.

## Best Practices

### Script Writing
- Keep sentences short and natural
- Add pauses with `[pause]` markers
- Write for speaking, not reading
- Front-load key message (first 5 seconds)

### Avatar Selection
- Match avatar to audience expectations
- Consistent avatar builds recognition
- Test different styles

### Background
- Clean, professional backgrounds work best
- Brand-colored backgrounds for consistency
- Avoid distracting elements

## Troubleshooting

### Avatar lip-sync issues
- Simplify complex words
- Add punctuation for natural pauses
- Use pronunciation guides for brand names

### Video generation failed
- Check script for special characters
- Ensure script isn't too long
- Try shorter segments

### Custom avatar rejected
- Video must be 2+ minutes
- Good lighting, stable camera
- Clear audio, facing camera
