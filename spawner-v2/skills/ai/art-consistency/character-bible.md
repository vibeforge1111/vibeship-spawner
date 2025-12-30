# Character Bible Template & Guide

A Character Bible is the single source of truth for visual consistency. Every generation references this document. Every QA check compares against this document.

---

## Template

Copy and fill out for each character:

```yaml
# CHARACTER BIBLE
# ================

character_name: "[Full Name]"
aliases: ["nickname1", "nickname2"]
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"

# ============================================================================
# IDENTITY ANCHORS
# These EXACT phrases go in every prompt. No synonyms. No variations.
# ============================================================================

identity_anchors:
  face: |
    [face shape] face, [eye size] [eye color] eyes, [eye shape descriptor],
    [nose description], [mouth/lips description], [any distinctive marks]

  hair: |
    [color - be specific] [style] hair, [length descriptor],
    [any accessories like clips, ribbons, hairbands]

  body: |
    [build descriptor], [height if relevant], [distinctive body features]

  outfit_primary: |
    [main clothing item with color and style],
    [secondary clothing items],
    [footwear]

  outfit_casual: |  # Optional - alternative outfit
    [describe alternative outfit if character has multiple]

  accessories: |
    [jewelry], [gloves], [belts], [bags], [weapons], [other items always present]

# ============================================================================
# STYLE SPECIFICATION
# ============================================================================

style:
  art_style: |
    [era] [medium] style, [shading type], [line weight],
    [specific influences or references]

  color_palette:
    primary: "#HEXCODE - [name]"
    secondary: "#HEXCODE - [name]"
    accent: "#HEXCODE - [name]"
    skin_tone: "#HEXCODE"
    hair_color: "#HEXCODE - [descriptive name]"
    eye_color: "#HEXCODE - [descriptive name]"

  lighting_default: |
    [default lighting style for this character]

# ============================================================================
# PROMPT TEMPLATES
# Copy-paste these, filling in [PLACEHOLDERS]
# ============================================================================

prompts:
  portrait: |
    [character_name], [face anchor], [hair anchor],
    portrait, looking at viewer,
    [style anchor], [lighting]

  full_body: |
    [character_name], [face anchor], [hair anchor],
    [outfit anchor], [accessories anchor],
    full body, [pose],
    [style anchor], [lighting]

  action: |
    [character_name], [face anchor], [hair anchor],
    [outfit anchor], [accessories anchor],
    [ACTION DESCRIPTION],
    [SETTING/BACKGROUND],
    [style anchor], dynamic lighting

# ============================================================================
# REFERENCE IMAGES
# ============================================================================

references:
  turnaround_sheet: "[URL or file path]"
  portrait_reference: "[URL or file path]"
  expression_sheet: "[URL or file path - if available]"
  outfit_reference: "[URL or file path]"

# ============================================================================
# LORA / TRAINING INFO (if applicable)
# ============================================================================

lora:
  model_file: "[filename.safetensors]"
  trigger_word: "[trigger]"
  recommended_weight: 0.7-0.9
  trained_on: "YYYY-MM-DD"
  training_images: 25

# ============================================================================
# NOTES & GOTCHAS
# ============================================================================

notes:
  common_issues: |
    - [List any recurring generation problems]
    - [e.g., "Hair tends to go purple in warm lighting"]

  what_works: |
    - [List prompts/settings that work well]

  avoid: |
    - [List things that break consistency]
```

---

## Example: Completed Character Bible

```yaml
# CHARACTER BIBLE
# ================

character_name: "Luna Silverfall"
aliases: ["Luna", "The Silver Star"]
created: "2025-01-15"
last_updated: "2025-01-20"

# ============================================================================
# IDENTITY ANCHORS
# ============================================================================

identity_anchors:
  face: |
    heart-shaped face, large expressive violet eyes with star-shaped highlights,
    small upturned nose, soft pink lips, pale porcelain skin

  hair: |
    silver twin-tails reaching waist-length, star-shaped crystal hair clips,
    wispy bangs framing face, subtle shimmer/sparkle effect

  body: |
    petite slender build, 152cm tall, graceful posture

  outfit_primary: |
    black sailor-style school uniform with purple trim on collar and sleeves,
    gold crescent moon brooch on chest, pleated black skirt above knee,
    black knee-high boots with silver buckles

  outfit_casual: |
    oversized lavender sweater, black shorts, silver star pendant visible,
    same boots or white sneakers

  accessories: |
    crescent moon pendant necklace (always visible), fingerless black gloves,
    silver bracelet on right wrist

# ============================================================================
# STYLE SPECIFICATION
# ============================================================================

style:
  art_style: |
    modern anime style (2020s), soft cel-shading with gradient shadows,
    clean medium-weight linework, vibrant saturated colors,
    influenced by Violet Evergarden and Your Name aesthetics

  color_palette:
    primary: "#2D2D44 - deep navy (uniform base)"
    secondary: "#8B5CF6 - violet (accents, eyes)"
    accent: "#FFD700 - gold (moon brooch, details)"
    skin_tone: "#FDE8E8 - pale pink"
    hair_color: "#C0C0C0 - true silver with slight blue undertone"
    eye_color: "#8B5CF6 - bright violet with pink highlights"

  lighting_default: |
    soft diffused anime lighting, subtle rim light on hair,
    gentle shadows, magical ambient glow

# ============================================================================
# PROMPT TEMPLATES
# ============================================================================

prompts:
  portrait: |
    Luna Silverfall, heart-shaped face, large expressive violet eyes with
    star highlights, silver twin-tails with star crystal clips, wispy bangs,
    portrait, looking at viewer, soft smile,
    modern anime style, soft cel-shading, clean linework, vibrant colors,
    soft diffused lighting, subtle rim light

  full_body: |
    Luna Silverfall, heart-shaped face, large violet eyes, silver twin-tails
    with star clips, black sailor uniform with purple trim, gold moon brooch,
    pleated black skirt, knee-high black boots with silver buckles,
    crescent moon pendant, fingerless black gloves,
    full body, standing pose,
    modern anime style, soft cel-shading, vibrant colors

  action: |
    Luna Silverfall, heart-shaped face, large violet eyes, silver twin-tails
    with star clips, black sailor uniform with purple trim, gold moon brooch,
    fingerless gloves, crescent pendant,
    [ACTION], [SETTING],
    modern anime style, dynamic composition, vibrant colors

# ============================================================================
# REFERENCE IMAGES
# ============================================================================

references:
  turnaround_sheet: "./references/luna_turnaround_v2.png"
  portrait_reference: "./references/luna_portrait_golden.png"
  expression_sheet: "./references/luna_expressions.png"
  outfit_reference: "./references/luna_outfit_details.png"

# ============================================================================
# LORA INFO
# ============================================================================

lora:
  model_file: "luna_silverfall_v3.safetensors"
  trigger_word: "luna_silverfall"
  recommended_weight: 0.8
  trained_on: "2025-01-18"
  training_images: 28

# ============================================================================
# NOTES & GOTCHAS
# ============================================================================

notes:
  common_issues: |
    - Hair tends toward purple in warm/sunset lighting - add "silver hair, not purple"
    - Star hair clips sometimes become flowers - explicitly mention "star-shaped crystal"
    - Gloves often omitted in action poses - always include in prompt

  what_works: |
    - Flux Kontext gives best face consistency
    - IP-Adapter at 0.7 strength locks in features well
    - Including "star highlights in eyes" prevents flat eye rendering

  avoid: |
    - Don't use "gray hair" (produces wrong color)
    - Don't omit hair clip description (will change style)
    - Don't generate at night scenes without explicit hair color (goes blue)
```

---

## Usage Guidelines

### Creating a New Character Bible

1. **Start with concept** - Have a clear mental image or reference art
2. **Generate exploration images** - Make 10-20 images to find the look you want
3. **Document what works** - When you get a great result, document EXACTLY what made it
4. **Create turnaround sheet** - Generate multi-view reference
5. **Lock in the bible** - No changes after production starts (unless versioned)

### Updating a Character Bible

- Version the update: `last_updated: "YYYY-MM-DD"`
- Note what changed and WHY
- Regenerate reference images if appearance changed
- Update all active prompts to match

### During Production

1. **Open bible before every generation session**
2. **Copy prompt templates, don't retype** (prevents typos and variation)
3. **Have reference images visible** during generation and QA
4. **Compare outputs to bible** not to previous outputs

---

## Quick Reference Checklist

Before generating, confirm:
- [ ] Character bible is open and loaded
- [ ] Identity anchors are copied exactly into prompt
- [ ] Style descriptors match bible
- [ ] Reference image is available for comparison
- [ ] Using correct model/LoRA if applicable

After generating, verify:
- [ ] Face matches bible reference
- [ ] Hair color and style match bible
- [ ] Outfit matches bible (all elements present)
- [ ] Art style matches series
- [ ] Accessories present per bible
