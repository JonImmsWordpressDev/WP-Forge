---
description: Theme structure, StrataWP component architecture, and build pipeline constraints.
globs: src/**/*, inc/**/*, templates/**/*, parts/**/*, patterns/**/*, theme.json, vite.config.ts
---

# Theme Architecture

## Layout

| Path                       | What it is                                                           |
| -------------------------- | -------------------------------------------------------------------- |
| `theme.json`               | Global settings, styles, and design tokens (single source of truth)  |
| `templates/` / `parts/`    | Block templates and template parts (`.html`, FSE)                    |
| `patterns/`                | Block patterns (`.php` with header comments)                         |
| `src/blocks/`              | Custom Gutenberg blocks (auto-registered by the build)               |
| `src/js/`, `src/scss/`     | Entry points defined in `vite.config.ts` (`src/css/` in some themes) |
| `inc/Components/`          | Theme-specific PHP components                                        |
| `vendor/stratawp/core/`    | The vendored StrataWP framework — **never hand-edit**                |
| `dist/`                    | Build output — **never edit**                                        |
| `inc/blocks-generated.php` | Generated block registration — **never edit**                        |

## Hard Rules

1. **Source files only.** `dist/` and generated files are artifacts of `pnpm build`.
2. **The framework is vendored.** `vendor/stratawp/core/` is replaced wholesale on framework updates. Custom behavior belongs in `inc/Components/` and `stratawp_*` filters, never in vendor files.
3. **pnpm only** for installs and scripts.
4. **Scaffold with the CLI:** `stratawp block:new`, `component:new`, `template:new`, `part:new`.

## PHP Component Architecture

- Every component implements `ComponentInterface`: `get_slug(): string` + `initialize(): void` (hook registrations go in `initialize()`, constructors stay side-effect free).
- Components are registered in `functions.php` via the `Theme` class, and the `stratawp_theme_components` filter can add/remove/replace them.
- Framework extension points are `stratawp_*` filters — e.g. `stratawp_conditional_css_files`, `stratawp_preconnect_hints`, `stratawp_defer_scripts`. Prefer filters over hardcoding.

## Build Pipeline

- Vite compiles entry points and blocks to `dist/`; WordPress enqueues via the generated manifest.
- `pnpm dev` runs the dev server with HMR (JS/TS, SCSS, and PHP hot reload).
- `pnpm build` produces production assets and regenerates `inc/blocks-generated.php`.

## Naming

- Block namespace = theme slug. Component slugs kebab-case; PHP classes PascalCase; TS files kebab-case.
