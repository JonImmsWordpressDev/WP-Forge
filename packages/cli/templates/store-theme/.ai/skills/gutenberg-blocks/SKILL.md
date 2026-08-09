---
description: Scaffolding custom Gutenberg blocks and authoring block patterns in this theme.
globs: src/blocks/**/*, patterns/**/*
---

# Gutenberg Blocks & Patterns

## Blocks

Scaffold — never hand-roll:

```bash
stratawp block:new hero
```

This creates `src/blocks/hero/` with `block.json`, `index.tsx` (editor), `save.tsx` (front end), and styles.

Rules:

- **Auto-registration:** the build scans `src/blocks/**/block.json` and regenerates `inc/blocks-generated.php`. Never edit that file.
- **apiVersion 3** for all new blocks; namespace = theme slug.
- **Dynamic output** uses `render.php` + `"render"` in `block.json`; static output lives in `save.tsx`.
- **Changing a shipped block's attributes or save output requires a `deprecated` entry** — otherwise existing content shows block-recovery errors.
- Front-end behavior should prefer the Interactivity API (`viewScriptModule`, `data-wp-*` directives) over ad-hoc scripts.

Verify: `pnpm build`, then insert the block in the editor — no console errors, no "attempt block recovery" prompts.

## Patterns (`patterns/*.php`)

- **Default to native blocks** (`wp:paragraph`, `wp:heading`, `wp:group`, …) with `className` hooks — they stay editable and render WYSIWYG in the editor.
- **Use `wp:html` only when it earns its keep:** inline custom-classed spans the rich-text editor strips, custom data attributes, or embedded SVG. Keep chunks small.
- **Never put bare `<!-- ... -->` HTML comments between blocks** — use `<?php /* ... */ ?>`. Bare comments make the parser wrap them in empty paragraphs (visible layout gaps) or fall back to the Classic block.
- **Patterns are templates, not live references.** Once inserted, page content is a copy — editing the pattern file does not update existing pages.
- Watch `theme.json` `<p>` margins when converting a `<div>`/`<span>` to `wp:paragraph` — add explicit margins to affected styles.
