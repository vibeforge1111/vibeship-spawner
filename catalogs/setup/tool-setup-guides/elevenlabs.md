# ElevenLabs Setup Guide

**Best for:** Voiceovers, voice cloning, sound effects

## Why ElevenLabs?

- **Best-in-class voice synthesis:** Natural, expressive AI voices
- **Voice cloning:** Create custom voices from samples
- **Sound effects:** Generate SFX from text descriptions
- **Multiple voices:** 30+ pre-built voices to choose from

## Cost

- **Free tier:** 10,000 characters/month (about 10 min of audio)
- **Starter ($5/mo):** 30,000 characters + 3 custom voices
- **Creator ($22/mo):** 100,000 characters + 10 custom voices
- **Typical usage:** Free tier for testing, Starter for regular use

## Setup Steps

### 1. Create Account

1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Click "Get Started Free"
3. Sign up with Google or email

### 2. Get API Key

1. Go to [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)
2. Click "Create API Key"
3. Copy the key

### 3. Add to Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "elevenlabs": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "ELEVENLABS_API_KEY": "your_key_here"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

## Available Voices

**Professional:**
- Rachel - Warm, professional female
- Adam - Clear, confident male
- Matthew - Warm, authoritative male

**Conversational:**
- Josh - Energetic, relatable male
- Emily - Friendly, approachable female

**Characters:**
- Many more available in the voice library

Browse all at [elevenlabs.io/voice-library](https://elevenlabs.io/voice-library)

## Key Settings

| Setting | Range | Effect |
|---------|-------|--------|
| Stability | 0-1 | Lower = more expressive, Higher = more consistent |
| Clarity | 0-1 | Higher = clearer diction |
| Style | 0-1 | Higher = more personality |

**Recommended defaults:**
- Explainer videos: Stability 0.5, Clarity 0.8
- Emotional content: Stability 0.3, Clarity 0.6
- Professional announcements: Stability 0.6, Clarity 0.9

## Example Usage

```
Create a voiceover using ElevenLabs with the Rachel voice:

"Welcome to FlowState. [pause] Your AI-powered productivity partner.
In just three steps, you'll automate the tasks that slow you down.
Let's get started."

Use stability 0.5 for warmth.
```

## Sound Effects

ElevenLabs also generates sound effects:

```
Generate a sound effect: "Soft notification chime,
friendly and modern, like a successful action completion"
```

## Troubleshooting

### "Quota exceeded"
- Check your usage at elevenlabs.io/app/usage
- Free tier is limited; upgrade if needed

### "Voice not found"
- Get voice IDs from the voices page
- Use voice name if ID unknown

### Audio sounds robotic
- Lower stability for more natural expression
- Try a different voice that fits the content better
