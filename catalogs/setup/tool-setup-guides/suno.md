# Suno Setup Guide

**Best for:** AI music generation, jingles, background music, brand audio

## Why Suno?

- **Full songs:** Generates complete music with vocals
- **Instrumental:** Create background music and soundtracks
- **Any genre:** From corporate to electronic to orchestral
- **Quick iteration:** Generate multiple variations fast

## Cost

- **Free tier:** 50 credits/day (about 10 songs)
- **Pro ($10/mo):** 2,500 credits/month
- **Premier ($30/mo):** 10,000 credits/month
- **Typical usage:** Free for testing, Pro for regular use

## Current API Status

**Note:** Suno doesn't have an official public API yet. Options:

1. **Use Suno directly:** Generate in browser, download, upload to project
2. **Unofficial APIs:** Third-party wrappers exist but may break
3. **Coming soon:** Official API expected in 2025

For now, we recommend the manual workflow described below.

## Manual Workflow (Recommended)

### 1. Create Account
1. Go to [suno.com](https://suno.com)
2. Sign up with Discord, Google, or email

### 2. Generate Music
1. Enter your prompt (see examples below)
2. Generate 2 variations per prompt
3. Download the ones you like

### 3. Add to Project
Save downloaded music to your marketing assets folder for Claude to reference.

## Prompt Best Practices

### Structure
```
[Genre] [Instruments] [Tempo] [Mood] [Reference] [Use case]
```

### Corporate/Professional
```
Uplifting corporate pop, acoustic guitar and piano,
subtle strings, 110 BPM, inspiring motivational mood,
modern commercial music, no vocals, professional background music
```

### Tech/Innovation
```
Modern electronic, synth arpeggios, clean digital beats,
118 BPM, futuristic optimistic, minimal and sleek,
no vocals, tech startup vibes like Apple commercial music
```

### Emotional/Story
```
Cinematic orchestral, solo piano intro building to full strings,
emotional journey, 70 BPM starting slow building to inspiring,
Hans Zimmer inspired, no vocals, documentary style
```

### Social/Trendy
```
Catchy pop-electronic, strong hook in first 3 seconds,
128 BPM, trending sound vibes, energetic and fun,
with vocals, viral potential
```

## Key Tips

### For Background Music
- Add "no vocals, instrumental only"
- Specify "loopable" for repeating content
- Request specific duration if needed

### For Brand Jingles
- Keep under 10 seconds
- Make melody memorable and simple
- Request "audio logo style"

### For Video Sync
- Specify exact BPM for timing
- Describe energy arc: "builds from quiet to triumphant"
- Request "cinematic" for emotional content

## Example Usage with Claude

Since no API yet, use this workflow:

```
I need background music for a product video.

Requirements:
- 60 seconds
- Tech/innovation feel
- Builds energy toward end
- No vocals

Generate a Suno prompt for me, then I'll create it
and save to /marketing-assets/audio/
```

Claude will provide the optimized prompt. You generate in Suno, save the file.

## Future API Integration

When Suno releases their official API, we'll update the MCP configuration. The prompts and patterns you learn now will work the same way.

## Alternatives

If you need API access now:

| Service | API | Best For |
|---------|-----|----------|
| Soundraw | Yes | Customizable background music |
| AIVA | Yes | Orchestral/emotional scores |
| Beatoven.ai | Yes | Video background music |
| Mubert | Yes | Infinite streaming music |

These can be integrated with the fetch MCP for automated generation.
