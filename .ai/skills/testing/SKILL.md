---
description: Vitest unit testing, Playwright accessibility E2E, and wp-env workflows for StrataWP.
globs: packages/**/*.test.ts, packages/testing/**/*, examples/*/tests/**/*, playwright.a11y.config.ts
---

# Testing

StrataWP has two test layers: fast Vitest unit tests across packages, and a Playwright accessibility E2E suite that gates CI.

## Unit Tests (Vitest)

```bash
pnpm test              # all workspaces via Turborepo
cd packages/sync && pnpm test   # single package
```

- Test files live next to sources as `*.test.ts`.
- `@stratawp/testing` provides shared Vitest and Playwright utilities — check it before writing bespoke helpers.
- New logic in `packages/*` should ship with unit tests; pure refactors must keep existing tests green.

## Accessibility E2E (Playwright + axe-core)

CI (`a11y.yml`) runs axe-core against the built `examples/basic-theme` on wp-env and **fails on any WCAG 2.1 A/AA violation**.

Run locally:

```bash
pnpm exec wp-env start
pnpm exec wp-env run cli wp theme activate basic-theme
pnpm test:e2e
```

- Config: `examples/basic-theme/playwright.a11y.config.ts`.
- If you change rendered markup, styles affecting contrast/focus, or navigation behavior, run this suite before submitting.
- Never "fix" a violation by removing the element from the scan — fix the accessibility issue.

## Environment (wp-env)

- `.wp-env.json` at the repo root defines the WordPress environment.
- `pnpm exec wp-env start` / `stop` manage it; `pnpm exec wp-env run cli wp <command>` runs WP-CLI inside it.
- The Vite dev server (`pnpm dev` in a theme) provides HMR against the running site on port 3000.

## Performance Checks

- `pnpm test:perf` runs Lighthouse CI (`.lighthouserc.cjs`) — use it when a change could affect loading behavior (enqueue order, resource hints, conditional styles).

## Definition of Done

A change is test-complete when:

1. `pnpm ai:check` passes (lint, format, typecheck, unit tests).
2. Affected-surface suites pass (`pnpm test:e2e` for front-end output, `pnpm test:perf` for loading changes).
3. New behavior has a test that fails without the change.
