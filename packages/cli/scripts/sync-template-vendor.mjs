/**
 * Refresh each bundled template's vendored stratawp/core from packages/core.
 *
 * The templates ship a snapshot of core in vendor/stratawp/core (vendor/ is
 * gitignored, so it exists only on disk). Runs automatically via the cli
 * package's `prepack` hook so every published tarball carries current core —
 * previously the snapshot silently rotted (issue #26's stale Assets.php
 * shipped for months).
 */

import { cp, rm, access } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const cliRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const coreRoot = join(cliRoot, '..', 'core')
const templates = ['basic-theme', 'advanced-theme', 'store-theme']

try {
  await access(join(coreRoot, 'src'))
} catch {
  console.error('sync-template-vendor: packages/core/src not found — run from the monorepo')
  process.exit(1)
}

for (const template of templates) {
  const target = join(cliRoot, 'templates', template, 'vendor', 'stratawp', 'core')
  await rm(join(target, 'src'), { recursive: true, force: true })
  await cp(join(coreRoot, 'src'), join(target, 'src'), { recursive: true })
  for (const file of ['composer.json', 'README.md']) {
    await cp(join(coreRoot, file), join(target, file))
  }
  console.log(`sync-template-vendor: refreshed ${template}/vendor/stratawp/core`)
}
