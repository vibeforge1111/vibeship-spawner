# Marketing Team Setup Checklist

Use this checklist to verify your setup is complete. Ask Claude to help verify each step.

## Pre-Flight Check

Tell Claude:
```
Verify my marketing team setup and tell me what's working.
```

Claude will check your configuration and report status.

---

## Checklist by Level

### Level 1: Basic (No API Keys)

- [ ] **Spawner MCP connected**
  - Test: "List available marketing skills"
  - Expected: Should list 30+ marketing skills

- [ ] **Filesystem MCP configured**
  - Test: "Save a test file to my marketing folder"
  - Expected: File should be created

- [ ] **Marketing agents loaded**
  - Test: "Load the creative director agent"
  - Expected: Should describe agent capabilities

**If all pass:** You can do content strategy, copywriting, planning, and reviews.

---

### Level 2: Visual Creator

Everything from Level 1, plus:

- [ ] **Image generation working**
  - Test: "Generate a simple test image: blue circle on white background"
  - Expected: Should generate and save image
  - Tools: Fal.ai, Midjourney, or Replicate

**If all pass:** You can create marketing images, social graphics, ad creatives.

---

### Level 3: Full Creative Suite

Everything from Levels 1-2, plus:

- [ ] **Video generation working**
  - Test: "Generate a 5-second test video: abstract flowing colors"
  - Expected: Should generate and save video
  - Tools: Runway or Fal.ai video models

- [ ] **Voice synthesis working**
  - Test: "Generate test audio: 'Hello, this is a test'"
  - Expected: Should generate and save audio file
  - Tools: ElevenLabs

- [ ] **Music generation working**
  - Test: "Create a 10-second ambient music clip"
  - Expected: Should provide Suno prompt or generate directly
  - Tools: Suno (manual) or Soundraw (API)

**If all pass:** You have full creative capabilities.

---

## Quick Diagnostic

Ask Claude:
```
Run a diagnostic on my marketing setup. For each tool, tell me:
1. Is it configured?
2. Can you connect to it?
3. What can I create with it?
```

---

## Common Issues & Fixes

### Issue: "MCP server not responding"
**Fix:**
1. Check config file path is correct
2. Restart Claude Desktop completely
3. Verify JSON syntax in config (use a JSON validator)

### Issue: "Permission denied"
**Fix:**
1. Make sure the filesystem path exists
2. Check folder permissions
3. Try a simpler path (no spaces, no special characters)

### Issue: "API key invalid"
**Fix:**
1. Regenerate key in the provider's dashboard
2. Check for extra spaces when pasting
3. Verify key is active and has credits

### Issue: "Rate limited"
**Fix:**
1. Wait a few minutes
2. Check your usage in provider dashboard
3. Consider upgrading plan if hitting limits regularly

### Issue: Tool works but output quality is poor
**Fix:**
1. Use the prompt templates from `marketing-prompt-library.json`
2. Add more detail to prompts
3. Generate multiple variations and select best

---

## Verification Commands

### Check Spawner Connection
```
Call spawner_skills with action "list" and category "marketing"
```

### Check Filesystem Access
```
List files in my marketing assets folder
```

### Check Image Generation
```
Using Fal.ai, generate a test image with prompt "blue square, minimal"
```

### Check Full System
```
I want to test my marketing setup. Walk me through creating:
1. A simple social media caption (uses copywriting skill)
2. An image for the post (uses image generation)
3. Save both to my marketing folder (uses filesystem)
```

---

## Success Criteria

Your setup is **complete** when you can:

1. ✅ Load any marketing skill
2. ✅ Generate text content with Claude
3. ✅ Save files to your marketing folder
4. ✅ Generate images (if Level 2+)
5. ✅ Generate video/audio (if Level 3)

---

## Next Steps After Setup

1. **Try a playbook:** "Run the blog-post quickstart workflow"
2. **Load an agent:** "I want to work with the Visual Creator agent"
3. **Full campaign:** "Let's plan a product launch campaign"

See `examples/sample-campaign-product-launch.json` for a complete example.
