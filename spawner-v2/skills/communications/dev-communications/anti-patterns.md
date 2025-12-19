# Developer Communications Anti-Patterns

Approaches that seem like good documentation practices but undermine developer trust and adoption.

---

## 1. Comprehensive Before Useful

**What it looks like**: Documenting every feature before documenting any workflow. Complete API reference, but no getting started guide. All the details, none of the context.

**Why it seems good**: Thoroughness. Complete coverage. "Everything is documented."

**Why it fails**: Developers can't find what they need. They drown in reference material without learning how to accomplish their goals. Documentation exists but doesn't help.

**What to do instead**: Start with the happy path. Document what developers actually need to do. Build out from common use cases to edge cases.

---

## 2. Internal Wiki as External Docs

**What it looks like**: Publishing internal documentation externally with minimal editing. Internal terminology, internal context, internal organization—exposed to customers.

**Why it seems good**: Fast. Content already exists. "Developers will figure it out."

**Why it fails**: External developers lack context. Internal docs assume knowledge they don't have. Organization doesn't match external mental models.

**What to do instead**: Rewrite for external audience. Explain context. Structure around developer goals, not internal organization. Have external developer review.

---

## 3. Auto-Generated Everything

**What it looks like**: Relying entirely on generated documentation. JSDoc comments become the only documentation. No tutorials, no guides, just API reference.

**Why it seems good**: Efficient. Always in sync. Developers can figure it out.

**Why it fails**: Generated docs lack narrative. They explain what, not why or how. Developers need to understand concepts, not just method signatures.

**What to do instead**: Generated reference + human-written guides. Use generation for what it's good at (accuracy, completeness), humans for what they're good at (explanation, examples, narrative).

---

## 4. The Living Document Excuse

**What it looks like**: "Documentation is a living document" as excuse for publishing incomplete or inaccurate docs. Ship now, fix later. Version 0.1 documentation for version 2.0 product.

**Why it seems good**: Agile. Iterative. "We'll improve it."

**Why it fails**: Developers experience the docs as they are, not as they will be. Trust lost now isn't recovered by improvements later. "Living document" often means "nobody's responsible."

**What to do instead**: Minimum viable documentation must actually be viable. Incomplete is okay if clearly marked. Inaccurate is never okay. Own and prioritize documentation work.

---

## 5. Docs Team Silo

**What it looks like**: Technical writers producing documentation without engineering involvement. Content created by people who don't use the product.

**Why it seems good**: Specialists do what they're good at. Writers write, engineers engineer.

**Why it fails**: Writers lack deep technical knowledge. Examples may not reflect real usage. Accuracy requires engineering review anyway. Docs lag behind product.

**What to do instead**: Engineers own accuracy, writers own clarity. Collaborative process. Engineers write first drafts for technical content. Writers polish and structure.

---

## 6. One Doc Fits All

**What it looks like**: Same documentation for all audiences. New developers and experts read the same content. Beginners wade through advanced concepts. Experts can't find deep details.

**Why it seems good**: Simpler to maintain. Single source of truth.

**Why it fails**: Different audiences need different content. Beginners are overwhelmed. Experts are slowed down. Nobody is well-served.

**What to do instead**: Audience-specific paths. Beginner tutorials, expert guides. Progressive disclosure. "If you already know X, skip to Y."

---

## 7. Format Over Function

**What it looks like**: Beautiful documentation portal with poor content. Sophisticated search, zero helpful results. Great design, wrong information.

**Why it seems good**: Looks professional. Modern tooling. Good first impression.

**Why it fails**: Developers need answers, not aesthetics. A beautiful lie is worse than an ugly truth. Format can't compensate for content failures.

**What to do instead**: Content first, format second. Accurate beats beautiful. Invest in what matters to developers: accuracy, completeness, examples.

---

## 8. PDF Documentation

**What it looks like**: Primary documentation delivered as PDF downloads. Static documents rather than web pages.

**Why it seems good**: Offline access. Print-friendly. Feels "official."

**Why it fails**: Can't be linked to specific sections. Can't be updated incrementally. Can't be searched alongside other docs. Can't embed interactive examples. Developers hate PDFs.

**What to do instead**: Web-native documentation. Deep linking. Real-time updates. PDF export only as secondary option for those who really need it.

---

## 9. Hiding Breaking Changes

**What it looks like**: Breaking changes buried in release notes. Major API changes without prominent warning. "Oh, we deprecated that three versions ago."

**Why it seems good**: Don't scare developers. Minimize perceived disruption.

**Why it fails**: Developers discover breaking changes when their code breaks. They feel blindsided. Trust evaporates. "Why didn't you tell me?"

**What to do instead**: Breaking changes prominently highlighted. Migration guides front and center. Deprecation warnings loud and early. Treat breaking changes as first-class content.

---

## 10. Optimizing for SEO Over Users

**What it looks like**: Documentation structured for search engines, not developers. Keyword stuffing. Thin pages to capture search terms. Content split unnaturally.

**Why it seems good**: More traffic. Better rankings. Developers find you through Google.

**Why it fails**: Developers find you but can't use what they find. Traffic without utility. High bounce rates. User experience sacrificed for discovery.

**What to do instead**: Write for developers first. Good content ranks naturally. Structure for usability, not keywords. If SEO and usability conflict, pick usability.

---

## 11. Changelog As Afterthought

**What it looks like**: Changelogs written at the last minute. "Bump version" commits. Autogenerated from commit messages without curation.

**Why it seems good**: Fast. Automated. "It's there."

**Why it fails**: Changelogs are for humans, not robots. Commit messages don't explain impact. Developers can't assess whether to upgrade.

**What to do instead**: Changelogs written deliberately. User-facing changes explained. Impact assessed. Migration guidance included. Treat changelogs as user communication, not technical logging.

---

## 12. Tribal Knowledge Documentation

**What it looks like**: Documentation that captures knowledge once held by one person. Internal terminology enshrined. Context that made sense to the author but nobody else.

**Why it seems good**: Knowledge preserved. Author documented what they know.

**Why it fails**: Without context, documentation doesn't transfer knowledge. Future readers (including the author) won't understand. Tribal knowledge becomes tribal confusion.

**What to do instead**: Document for someone who doesn't know. Have someone who doesn't know review. Explain context, not just facts. Write to be understood by future strangers.
