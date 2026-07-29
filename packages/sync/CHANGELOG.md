# @stratawp/sync

## 0.1.1

### Patch Changes

- Republish `@stratawp/sync` as 0.1.1 — 0.1.0 was burned by an earlier unpublish and npm forbids reusing it, which left `@stratawp/cli@2.0.2`'s exact pin unresolvable. Internal workspace pins now publish as caret ranges (`workspace:^`) so a single republished dependency no longer forces a lockstep chain.
