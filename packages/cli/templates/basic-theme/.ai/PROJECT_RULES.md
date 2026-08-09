# Project Rules & Learned Guidelines

This file is updated over time by the AI agents working on this theme. It is long-term memory: a running log of theme-specific guidelines, discovered patterns, and decisions.

> [!IMPORTANT]
> **AI Agents:** Read this file on every session. Keep it updated with new architectural decisions and conventions established during your work.

---

## 🏗️ Discovered Theme Configuration

<!--
Agent: Document this theme's setup as you discover it (registered components, block list, template structure, build options).
-->

- **Theme Type:** WordPress block theme (FSE), built on the StrataWP framework.
- **Framework Location:** `vendor/stratawp/core/` (vendored — never hand-edit; replaced on framework updates).
- **Registered Components:** _(read `functions.php` and list them here)_
- **Custom Blocks:** _(list `src/blocks/*` here)_

---

## 🎨 Discovered Design System & Tokens

<!--
Agent: Document the palette, typography, and spacing configured in theme.json.
-->

- **Color Palette:**
- **Typography Rules:**
- **Spacing Scale:**

---

## 💻 Theme-Specific Coding Patterns

<!--
Agent: Document custom patterns established in this theme (naming standards, APIs to use or avoid, CSS conventions).
-->

- **PHP Components:** Implement `ComponentInterface` (`get_slug()` + `initialize()`); register in `functions.php` or via the `stratawp_theme_components` filter.
- **Blocks:** Live in `src/blocks/<name>/` with `block.json`; auto-registered by the build — never edit `inc/blocks-generated.php`.
- **Patterns:** Native blocks first; `wp:html` only when unavoidable; no bare HTML comments between blocks.

---

## 📝 Running Architectural Decisions & Learnings Log

<!--
Agent: Keep a chronological log of decisions and gotchas.

Entry format:

### 📅 YYYY-MM-DD - Short Title
- **Context:** What prompted the decision.
- **Decision:** What was done and where.
- **Key Learning:** The reusable insight.
-->
