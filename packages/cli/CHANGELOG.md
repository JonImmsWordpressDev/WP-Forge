# @stratawp/cli

## 2.0.4

### Patch Changes

- Export `./dist/create.js` from `@stratawp/cli` — the package's `exports` field blocked the subpath the `create-stratawp` wrapper resolves, so `npx create-stratawp` failed at launch with ERR_PACKAGE_PATH_NOT_EXPORTED.

## 2.0.3

### Patch Changes

- Republish `@stratawp/sync` as 0.1.1 — 0.1.0 was burned by an earlier unpublish and npm forbids reusing it, which left `@stratawp/cli@2.0.2`'s exact pin unresolvable. Internal workspace pins now publish as caret ranges (`workspace:^`) so a single republished dependency no longer forces a lockstep chain.
- Updated dependencies
  - @stratawp/sync@0.1.1

## 2.0.2

### Patch Changes

- Ship the iframed-editor CSS registration fix (#42) in the bundled template cores, replace the scaffolder's hardcoded `@stratawp/vite-plugin` pin with a version stamped at pack time (`templateDependencies`), and document `npx create-stratawp@latest` so returning users bypass the npx cache.
