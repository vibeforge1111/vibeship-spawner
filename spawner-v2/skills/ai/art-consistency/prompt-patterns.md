# Prompt Engineering Patterns for Consistency

Prompts are the contract with the AI model. Ambiguity in prompts produces variation in output. These patterns enforce consistency through precise prompting.

---

## Core Principles

### 1. Specificity Over Brevity
```
BAD:  "anime girl with blue hair"
GOOD: "heart-shaped face, large sapphire blue eyes, sky blue twin-tails
       shoulder-length with white ribbon, small nose, soft pink lips"
```
More words = less interpretation by model = more consistency.

### 2. Exact Terminology
Pick ONE term for each feature. Document it. Never substitute.
```
WRONG: Image 1 uses "silver hair", Image 2 uses "gray hair", Image 3 uses "platinum hair"
RIGHT: Always "silver hair with subtle blue undertone" - exact same phrase every time
```

### 3. Front-Loading Identity
Put character identity at the START of prompt. Models weight early tokens more.
```
BAD:  "A fantasy forest scene with magical lighting where Luna Silverfall stands..."
GOOD: "Luna Silverfall, silver twin-tails, violet eyes, black uniform, standing in
       a fantasy forest with magical lighting"
```

### 4. Explicit Over Implicit
Don't assume the model will "remember" or "understand" - state everything.
```
BAD:  "Luna in her usual outfit"
GOOD: "Luna, black sailor uniform with purple trim, gold moon brooch,
       pleated black skirt, knee-high boots"
```

---

## Prompt Structure Templates

### Portrait Template
```
[CHARACTER NAME], [FACE DESCRIPTION], [HAIR DESCRIPTION],
portrait, [EXPRESSION], looking at viewer,
[ART STYLE], [LIGHTING],
[QUALITY TAGS]
```

**Example:**
```
Luna Silverfall, heart-shaped face, large violet eyes with star highlights,
silver twin-tails with crystal star clips, wispy bangs,
portrait, gentle smile, looking at viewer,
modern anime style, soft cel-shading, clean linework,
soft diffused lighting, subtle rim light,
highly detailed, masterpiece
```

### Full Body Template
```
[CHARACTER NAME], [FACE DESCRIPTION], [HAIR DESCRIPTION],
[OUTFIT DESCRIPTION], [ACCESSORIES],
full body, [POSE],
[BACKGROUND/SETTING],
[ART STYLE], [LIGHTING],
[QUALITY TAGS]
```

**Example:**
```
Luna Silverfall, heart-shaped face, large violet eyes,
silver twin-tails with star clips,
black sailor uniform with purple trim, gold moon brooch,
pleated black skirt, knee-high black boots, fingerless gloves,
crescent moon pendant,
full body, standing with hands clasped,
simple gradient background,
modern anime style, soft cel-shading, vibrant colors,
studio lighting, soft shadows
```

### Action Scene Template
```
[CHARACTER NAME], [BRIEF IDENTITY ANCHORS],
[OUTFIT - abbreviated],
[ACTION/POSE],
[ENVIRONMENT],
[ART STYLE], dynamic composition,
[LIGHTING matching scene],
[QUALITY TAGS]
```

**Example:**
```
Luna Silverfall, silver twin-tails, violet eyes,
black sailor uniform, moon brooch,
casting magic spell, magical energy swirling around hands,
dark fantasy library with floating books,
modern anime style, dynamic composition, dramatic lighting,
magical glow effects, highly detailed
```

### Turnaround Sheet Template
```
character design sheet, multiple views,
[CHARACTER NAME], [FULL IDENTITY DESCRIPTION],
front view, side view, back view, 3/4 view,
white background, consistent lighting across all views,
reference sheet layout, same character all angles,
[ART STYLE], clean linework,
professional character sheet
```

---

## Consistency Enforcement Patterns

### Pattern: Color Locking
Explicitly state colors with hex codes in documentation, use descriptive names in prompts.

```yaml
# In character bible:
hair_color: "#C0C0C0 - silver with blue undertone"

# In prompt:
"silver hair with subtle blue undertone (not gray, not platinum)"
```

For lighting-sensitive colors:
```
"sky blue hair, maintaining blue hue even in warm lighting (not purple)"
```

### Pattern: Feature Grouping
Group related features to ensure they're processed together.

```
# BAD - features separated, may be processed independently:
"silver hair, violet eyes, black uniform, twin-tails, star clips"

# GOOD - features grouped logically:
"silver twin-tails with star-shaped crystal hair clips, large violet eyes,
black sailor uniform with purple trim"
```

### Pattern: Negative Prompting for Drift Prevention
Use negative prompts to explicitly prevent common drift.

```
# Negative prompt:
"gray hair, purple hair, ponytail, different hairstyle, changed outfit,
wrong eye color, different face shape, inconsistent style"
```

### Pattern: Style Anchoring
Anchor style to specific references, not vague terms.

```
# BAD:
"anime style"

# BETTER:
"modern anime style, soft cel-shading, clean linework"

# BEST:
"2020s anime aesthetic similar to Violet Evergarden,
soft gradient cel-shading, medium weight clean outlines,
vibrant saturated color palette"
```

### Pattern: Pose Isolation
When changing pose, keep everything else EXACTLY the same.

```
# Base prompt (approved):
"Luna, silver twin-tails, violet eyes, black uniform, standing neutral,
modern anime style, studio lighting"

# Pose variation (ONLY pose changes):
"Luna, silver twin-tails, violet eyes, black uniform, sitting on chair,
modern anime style, studio lighting"

# NEVER: Change pose + outfit + background + lighting simultaneously
```

---

## Model-Specific Patterns

### Flux / Flux Kontext
```
# Kontext LoRA pattern:
"[trigger_word], [identity description], [pose], [setting], [style]"

# Flux strength settings:
- Character LoRA: 0.7-0.9 (higher for strict consistency)
- Style LoRA: 0.5-0.7 (lower to blend with prompt)
```

### Midjourney
```
# Style reference:
"[prompt] --sref [reference_image_url] --sw 100"

# Character reference:
"[prompt] --cref [character_image_url] --cw 100"

# Combined:
"[prompt] --sref [style_url] --sw 75 --cref [char_url] --cw 100"
```

### Stable Diffusion + ControlNet
```
# IP-Adapter for character:
- Load character reference image
- IP-Adapter weight: 0.6-0.8
- Use with ControlNet for pose control

# Prompt structure:
"[detailed character description], [pose from ControlNet], [setting], [style]"
```

---

## Common Issues & Fixes

### Issue: Hair Color Changes
**Symptom:** Hair looks different colors in different lighting
**Fix:**
```
# Add explicit color maintenance:
"silver hair (maintaining silver color, not blue or purple)"

# In negative prompt:
"blue hair, purple hair, gray hair"
```

### Issue: Outfit Details Disappearing
**Symptom:** Buttons, trim, accessories vanish in action poses
**Fix:**
```
# Weight important details (if supported):
"(gold buttons:1.2), (purple trim:1.1), (moon brooch:1.3)"

# Or expand description:
"black uniform with clearly visible gold buttons down the front,
purple trim on collar visible, gold crescent moon brooch on chest"
```

### Issue: Face Drifting
**Symptom:** Face shape/features change between images
**Fix:**
```
# More specific face description:
"heart-shaped face with soft jawline, large round violet eyes,
small upturned nose, soft natural pink lips"

# Plus IP-Adapter with face reference at 0.7+ strength
```

### Issue: Style Mixing
**Symptom:** Some images look 90s anime, others look modern
**Fix:**
```
# Specify era and technical details:
"2020s modern anime style with soft gradient shading (not cel-shaded),
medium-weight clean linework, rounded soft features,
similar to Makoto Shinkai films"

# In negative:
"1990s anime, 1980s anime, retro anime, harsh cel-shading, angular features"
```

### Issue: Proportion Changes
**Symptom:** Character looks taller/shorter, head size varies
**Fix:**
```
# Specify proportions:
"petite figure 152cm height, anime proportions with 1:5.5 head-to-body ratio,
slender build"

# For multi-character, generate size chart reference first
```

---

## Prompt QA Checklist

Before using a prompt, verify:

- [ ] Character name is at the START
- [ ] ALL identity anchors present (face, hair, outfit, accessories)
- [ ] Using EXACT terminology from character bible (no synonyms)
- [ ] Style descriptors are specific (not just "anime style")
- [ ] Colors are described specifically (not just "blue")
- [ ] Negative prompt excludes common drift issues
- [ ] Quality tags included
- [ ] Only ONE variable changed from last approved prompt

---

## Prompt Version Control

Track prompts that work:

```yaml
prompt_history:
  - version: 1
    date: "2025-01-15"
    prompt: "[full prompt]"
    result: "approved - use as baseline"

  - version: 2
    date: "2025-01-16"
    prompt: "[modified prompt]"
    change: "Added explicit eye description"
    result: "approved - better eye consistency"

  - version: 3
    date: "2025-01-17"
    prompt: "[failed prompt]"
    change: "Removed hair clip description to shorten"
    result: "REJECTED - hair clips changed to flowers"
```

Document what works. Document what fails. Build institutional knowledge.
