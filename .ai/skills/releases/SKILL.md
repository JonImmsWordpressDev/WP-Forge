---
description: Changesets, npm trusted publishing (OIDC), and GitHub theme release workflow for StrataWP.
globs: .changeset/**/*, .github/workflows/publish-npm.yml, .github/workflows/release-theme.yml, scripts/ci-publish.mjs
---

# Releases & Publishing

StrataWP publishes npm packages via trusted publishing (OIDC) and theme zips via a GitHub release workflow. Releases are **user-initiated** — agents prepare changesets and verify pipelines, but never tag, publish, or create releases without an explicit request.

## Package Versioning (Changesets)

```bash
pnpm changeset            # record a change (pick packages + semver bump + summary)
pnpm version-packages     # apply pending changesets to package.json versions
```

- Every user-facing change to a published package (`@stratawp/cli`, `@stratawp/vite-plugin`, `@stratawp/sync`, `@stratawp/testing`, `@stratawp/explorer`, `@stratawp/headless`, `create-stratawp`) needs a changeset.
- `packages/core` (PHP) is not npm-published — its changes ride along with the next `@stratawp/cli` publish because `prepack` re-syncs the vendored template snapshot.

## npm Publishing (`.github/workflows/publish-npm.yml`)

- Triggered by `v*` tag pushes or manual dispatch; publishes every public workspace package whose version is not yet on the registry.
- **Authentication is OIDC trusted publishing.** There is no `NPM_TOKEN` secret — do not add one, and do not "fix" auth failures by introducing tokens.
- Each package lists this repo + `publish-npm.yml` as a trusted publisher on npmjs.com. **A brand-new package must have its trusted-publisher entry added on npmjs.com before its first CI publish** — otherwise the publish fails by design.
- `scripts/ci-publish.mjs` packs with pnpm (rewriting `workspace:` ranges) and publishes with npm ≥ 11.5.1, with provenance.

## Theme Releases (`.github/workflows/release-theme.yml`)

Publishing a GitHub Release triggers: full build → production Composer install → `style.css` version stamp from the tag → `strata-basic.zip` packaged and attached to the release. That zip is what the `Updates` component serves for one-click dashboard updates, so:

- Release tags must be semantic versions (`v1.2.3` or `1.2.3`).
- Breaking the zip layout breaks live-site updates — treat the packaging step as production code.

## Release Procedure (when the user asks)

1. Confirm pending changesets cover the changes (`.changeset/*.md`).
2. `pnpm version-packages`, review the version bumps and changelogs, commit.
3. Tag and push: `git tag vX.Y.Z && git push origin vX.Y.Z`.
4. For a theme release: `gh release create vX.Y.Z --title "vX.Y.Z" --generate-notes`.
5. Verify the workflow run published expected packages and/or attached the zip.
