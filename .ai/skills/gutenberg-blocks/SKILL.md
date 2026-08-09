---
description: Scaffolding, auto-registering, and building custom Gutenberg blocks in StrataWP themes.
globs: examples/*/src/blocks/**/*, packages/cli/templates/*/src/blocks/**/*, packages/vite-plugin/**/*
---

# Gutenberg Blocks

StrataWP blocks live in the theme's `src/blocks/` and are auto-registered by the Vite plugin — no manual `register_block_type` calls.

## Scaffolding

```bash
stratawp block:new hero --styleFramework=tailwind
```

This creates `src/blocks/hero/` with:

- `block.json` — metadata (apiVersion 3, theme-slug namespace like `forge-basic/hero`)
- `index.tsx` — Edit component (editor)
- `save.tsx` — Save component (static frontend render)
- styles per the chosen framework

## Auto-Registration Flow

1. The Vite plugin scans `src/blocks/**/block.json`.
2. It generates `inc/blocks-generated.php` with the registration code. **Never edit this file** — it is regenerated on every build.
3. Entry points are matched to their `block.json` and compiled to `dist/blocks/[block-name]/`.
4. WordPress enqueues editor/front-end assets through the generated manifest.

## Authoring Rules

- **apiVersion 3** for all new blocks.
- **Namespace = theme slug.** Never use `core/` or generic namespaces.
- **Dynamic vs static:** static output belongs in `save.tsx`; if output depends on runtime data, use a `render.php` + `"render"` in `block.json` and return `null` from save where appropriate.
- **Attribute changes need deprecations.** If you change attributes or save output of a shipped block, add a `deprecated` entry so existing content doesn't break. See `.claude/skills/wp-block-development/` for the full deprecation workflow.
- **Interactivity:** front-end behavior should prefer the Interactivity API (`viewScriptModule`, `data-wp-*` directives) over ad-hoc scripts. See `.claude/skills/wp-interactivity-api/`.

## Block Patterns (patterns/\*.php)

Patterns are PHP files with header comments in the theme's `patterns/` directory. Follow the pattern-authoring rules in `CLAUDE.md`:

- Default to native blocks (`wp:paragraph`, `wp:group`, …) with `className` hooks — they stay editable and render WYSIWYG.
- Use `wp:html` only when it earns its keep (custom spans the rich-text editor strips, custom data attributes, embedded SVG).
- Never place bare `<!-- ... -->` HTML comments between blocks — use `<?php /* ... */ ?>`.
- Remember patterns are templates: once inserted, page content is a copy. Editing the pattern file does not update existing pages.

## Verification

- `pnpm build` in the theme — confirm the block compiles and appears in `dist/blocks/`.
- Insert the block in the editor via wp-env (`pnpm exec wp-env start`) and confirm no console errors and no block-recovery prompts.
- If markup changed, run `pnpm test:e2e` (accessibility gate) before submitting.
