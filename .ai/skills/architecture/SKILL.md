---
description: StrataWP monorepo layout, PHP component architecture, and build pipeline constraints.
globs: packages/**/*, examples/**/*, turbo.json, pnpm-workspace.yaml
---

# Architecture & Conventions

This skill defines the structural rules every change in this repository must respect.

## Monorepo Layout

| Path                       | What it is                                                                       |
| -------------------------- | -------------------------------------------------------------------------------- |
| `packages/cli`             | `stratawp` / `create-stratawp` CLI (scaffolding, deploy, sync, update)           |
| `packages/vite-plugin`     | Vite ↔ WordPress integration (block auto-registration, PHP HMR, manifest)       |
| `packages/core`            | PHP framework (Theme class, components) — vendored into themes, NOT on Packagist |
| `packages/sync`            | Database sync, snapshots, rollback                                               |
| `packages/testing`         | Vitest + Playwright utilities                                                    |
| `packages/explorer`        | Component browser                                                                |
| `packages/headless`        | REST client, React hooks, Next.js utilities                                      |
| `packages/mcp`             | MCP server exposing generators + component catalog to AI agents                  |
| `packages/create-stratawp` | Theme creation CLI with bundled templates                                        |
| `examples/*`               | Working block themes (basic, advanced, store)                                    |

Turborepo (`turbo.json`) orchestrates `dev`, `build`, `test`, `typecheck`, `clean` across workspaces. Always run workspace scripts with **pnpm**.

## Hard Rules

1. **Never edit build output.** `dist/` directories, `*.min.*` files, and generated manifests are artifacts. Edit sources under `src/`.
2. **Never edit the vendored core snapshot.** `packages/cli/templates/*/vendor/stratawp/core/` is regenerated from `packages/core/src/` by `packages/cli/scripts/sync-template-vendor.mjs` on `prepack`. Change `packages/core/src/` and let the sync script do its job.
3. **Never edit `inc/blocks-generated.php`.** It is produced by the Vite plugin's block scan.
4. **Workspace protocol for internal deps.** Internal dependencies use `"@stratawp/x": "workspace:*"` (or `workspace:^`). Keep `pnpm-lock.yaml` in sync when specifiers change.

## PHP Component Architecture

- The `Theme` class (`packages/core/src/Theme.php`) is a singleton that validates and initializes components.
- Every component implements `ComponentInterface`: `get_slug(): string` + `initialize(): void`.
- Components exposing template tags also implement `TemplatingComponentInterface`.
- Default components live in `packages/core/src/Components/` (Setup, Assets, Blocks, Performance, Accessibility, ConditionalStyles, ImageSizes, Updates).
- Theme-specific components live in the theme's `inc/Components/`.
- The `stratawp_theme_components` filter lets child themes/plugins add, remove, or replace components — prefer extending via this filter over modifying core defaults.

## Vite Plugin Flow

1. Scans `src/blocks/**/block.json` and generates the PHP registration file.
2. Runs a WebSocket server in dev mode for PHP/template/theme.json hot reload.
3. Emits a WordPress-compatible manifest that `functions.php` consumes for `wp_enqueue_*`.
4. Resource hints and script deferral are filter-driven (`stratawp_dns_prefetch_hints`, `stratawp_preconnect_hints`, `stratawp_defer_scripts`) — never hardcode `<link rel>` tags in templates.

## Block Theme (FSE) Structure

Themes follow WordPress block theme conventions: `theme.json` (settings/styles), `templates/*.html`, `parts/*.html`, `patterns/*.php`, `src/blocks/` (auto-registered), `src/js/` + `src/scss|css/` entry points defined in `vite.config.ts`.

## Naming

- Block namespaces use the theme slug (e.g., `forge-basic/hero`).
- Component slugs are kebab-case; PHP classes are PascalCase; TS files are kebab-case.
- Framework filters are prefixed `stratawp_`.
