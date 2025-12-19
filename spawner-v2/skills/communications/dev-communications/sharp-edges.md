# Developer Communications Sharp Edges

Critical mistakes that destroy developer trust and tank adoption.

---

## 1. The Broken Example

**The mistake**: Publishing code examples that don't actually work. Copy-paste examples with syntax errors, missing imports, or outdated API calls.

**Why it happens**: Examples written but never tested. API changed after docs written. "It worked when I wrote it."

**Why it's devastating**: Developers copy-paste your example. It fails. They blame themselves first, then discover it's your fault. Trust evaporates. They assume all your docs are unreliable. One broken example poisons the well.

**The fix**: Every code example must be tested, ideally automatically. Extract examples from actual tests. Version examples with API. Prefer runnable snippets (CodeSandbox, Replit) that can't go stale.

---

## 2. The Missing Prereq

**The mistake**: Tutorials that assume setup steps without mentioning them. "Just call `api.configure()`"—without explaining that you need to install the SDK, get an API key, and initialize first.

**Why it happens**: Expert writes docs, forgets what beginners don't know. Seems obvious to the author.

**Why it's devastating**: New developers get stuck on step one. They can't distinguish "I did it wrong" from "the docs skipped something." They leave before they start.

**The fix**: Test tutorials with fresh environments. Have someone unfamiliar follow them literally. Start from zero. State every prerequisite explicitly. Link to getting started guide from every tutorial.

---

## 3. The Outdated Screenshot

**The mistake**: UI screenshots that don't match the current product. Dashboard screenshots from three versions ago. Instructions referencing buttons that moved.

**Why it happens**: Screenshots are expensive to update. Nobody owns screenshot freshness. Product moves faster than docs.

**Why it's devastating**: Developers can't follow instructions. They waste time hunting for features. They question whether the product works at all.

**The fix**: Minimize reliance on screenshots. Use text instructions where possible. When screenshots are necessary, tag them with version. Automated screenshot testing for critical flows. Treat screenshot updates as part of release process.

---

## 4. The Marketing Docs

**The mistake**: Documentation that reads like marketing copy. "Our revolutionary API enables seamless integration with our powerful platform." Adjectives instead of information.

**Why it happens**: Marketing writes it. Pressure to sell instead of explain. Don't understand developer mindset.

**Why it's devastating**: Developers see through marketing instantly. They're looking for how to do something, not why they should be impressed. Marketing copy signals that you don't respect their time.

**The fix**: Facts, not adjectives. Show what it does, not how great it is. Let the capability speak for itself. If you have to convince them it's good, it probably isn't.

---

## 5. The Jargon Trap

**The mistake**: Using internal terminology that developers don't know. "Configure your workspace's environment settings in the fleet dashboard." What's a fleet? What's a workspace here?

**Why it happens**: Internal terms are natural to the team. Nobody questioned whether outsiders understand. No glossary maintained.

**Why it's devastating**: Developers feel stupid. They can't complete tasks because they don't understand the vocabulary. They search for terms and find nothing.

**The fix**: Define terms on first use. Maintain a glossary. Have outsiders review docs. Use standard industry terms where possible. When you must use unique terms, explain them clearly.

---

## 6. The Copy-Paste Trap

**The mistake**: Duplicating content across multiple pages without a single source of truth. Same setup instructions in 5 places, each slightly different.

**Why it happens**: Easier to copy than to link. Different authors, different times. No content architecture.

**Why it's devastating**: Content diverges. One version gets updated, others don't. Developers find conflicting information. Which one is right?

**The fix**: Single source of truth for each concept. Include or link, don't copy. Content reuse systems. When you must duplicate, track all instances.

---

## 7. The Missing Error

**The mistake**: Not documenting error messages and how to fix them. API returns "Error 4019" with no explanation anywhere in docs.

**Why it happens**: Errors are edge cases. "They shouldn't happen." Nobody thinks to document what went wrong.

**Why it's devastating**: Developer hits error, searches for it, finds nothing. They're stuck. They open a support ticket. They tweet their frustration. They evaluate competitors.

**The fix**: Document every error code. Include: what it means, why it happens, how to fix it. Error message text should be searchable. Errors are first-class documentation.

---

## 8. The Dead Link

**The mistake**: Links in documentation that go to 404 pages. References to moved or deleted content. Broken internal navigation.

**Why it happens**: Docs reorganized, links not updated. External resources moved. Nobody checks links regularly.

**Why it's devastating**: Developers hit dead ends. They lose trust. They assume the product is abandoned or unmaintained.

**The fix**: Automated link checking. Redirects for moved content. Regular audits. Treat broken links as bugs.

---

## 9. The Version Mismatch

**The mistake**: Documentation that doesn't specify which version of the product it applies to. Examples that work in v2 but not v3, without mentioning the version.

**Why it happens**: Only latest version documented. Historical docs not maintained. Version tags not implemented.

**Why it's devastating**: Developers using older versions can't find relevant docs. Developers upgrading don't know what changed. Everyone is confused about what applies to them.

**The fix**: Version your docs. Make version selector prominent. Document migration paths. Keep docs for supported versions.

---

## 10. The Wall of Text

**The mistake**: Dense paragraphs without structure. No headers, no code, no examples—just explanation after explanation.

**Why it happens**: Author knows the material deeply. Writes like an essay. Doesn't consider how developers read.

**Why it's devastating**: Developers scan, they don't read. A wall of text is unscannable. They miss what they need. They give up.

**The fix**: Structure everything. Headers, bullets, code blocks. One idea per paragraph. Scannable headings that answer "what will I learn here?"

---

## 11. The Assumed Context

**The mistake**: Documentation that only makes sense if you already know the answer. "To fix this, just configure the resolver correctly." What resolver? Correctly how?

**Why it happens**: Expert curse. Author knows the context, assumes reader does too.

**Why it's devastating**: The people who need docs most are the ones without context. They read it, don't understand, and assume they're the problem.

**The fix**: Explain from first principles. Link to context when needed. Test with beginners. Ask "would someone encountering this for the first time understand?"

---

## 12. The Changelog Non-Change

**The mistake**: Changelogs that don't tell you what changed. "Various bug fixes and improvements." "Updated dependencies." Version numbers without substance.

**Why it happens**: Lazy changelog entries. Nobody wants to write them. "Nobody reads changelogs anyway."

**Why it's devastating**: Developers deciding whether to upgrade have no information. They can't assess risk. They can't find what broke their code. They don't trust your releases.

**The fix**: Specific, actionable changelogs. What changed, why, and what you need to do. Breaking changes highlighted. Migration instructions included.
