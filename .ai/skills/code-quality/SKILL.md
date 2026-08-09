---
description: Linting, formatting, type-checking, and the pre-flight ai:check gate for StrataWP.
globs: packages/**/*.ts, packages/**/*.tsx, packages/**/*.php, examples/**/*, eslint.config.js, .prettierrc
---

# Code Quality Standards

Every change must pass the repository's quality gates before it is submitted. Run checks locally — do not rely on CI to discover failures.

## The Pre-Flight Gate

```bash
pnpm ai:check
```

This runs, in order: `pnpm lint` (ESLint), `pnpm format:check` (Prettier), `pnpm typecheck` (tsc across workspaces via Turborepo), and `pnpm test` (Vitest across workspaces). All four must pass.

## Individual Tools

| Command             | Scope                                                                             |
| ------------------- | --------------------------------------------------------------------------------- |
| `pnpm lint`         | ESLint (flat config, `eslint.config.js`) across the repo                          |
| `pnpm lint:fix`     | ESLint with auto-fix                                                              |
| `pnpm lint:php`     | PHPCS against theme locations (needs `composer install` in `packages/core` first) |
| `pnpm format`       | Prettier write for `*.{ts,tsx,md,json}`                                           |
| `pnpm format:check` | Prettier verification only                                                        |
| `pnpm typecheck`    | TypeScript project checks via Turborepo                                           |
| `pnpm test`         | Vitest unit tests via Turborepo                                                   |
| `pnpm test:e2e`     | Playwright accessibility E2E (requires running wp-env)                            |

## Rules of Engagement

1. **Fix, don't suppress.** Do not add `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or `phpcs:ignore` comments to silence a failure unless the user explicitly approves it and the reason is documented inline.
2. **PHP changes require PHPCS.** When touching PHP under theme locations (`packages/cli/templates/*`, `examples/*`), run `pnpm lint:php`. Core PHP (`packages/core/src/`) follows WordPress coding standards conventions (snake_case methods, Yoda conditions where established — match the surrounding file).
3. **Front-end output changes require the a11y gate.** CI fails on any WCAG 2.1 A/AA axe-core violation. If your change affects rendered markup or styles, run `pnpm test:e2e` against wp-env before submitting.
4. **Formatting is not optional.** Run `pnpm format` before finishing; never hand-format against Prettier.
5. **No new dependencies without cause.** Adding a package dependency is an architectural decision — it belongs in a spec (see [Feature Planning](../feature-planning/SKILL.md)), not a drive-by change.

## When a Gate Fails

- Read the first error, not the last — cascading failures usually share a root cause.
- Reproduce the specific failing tool directly (e.g., `pnpm lint`) rather than re-running the whole gate.
- If a failure is pre-existing on `main` and unrelated to your change, report it to the user instead of fixing it silently in the same changeset.
