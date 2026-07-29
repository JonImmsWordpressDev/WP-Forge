/**
 * Refresh each bundled template's vendored stratawp/core from packages/core.
 *
 * The templates ship a snapshot of core in vendor/stratawp/core (vendor/ is
 * gitignored, so it exists only on disk). Runs automatically via the cli
 * package's `prepack` hook so every published tarball carries current core —
 * previously the snapshot silently rotted (issue #26's stale Assets.php
 * shipped for months).
 */

import { cp, rm, access, readFile, writeFile } from 'fs/promises'
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

// Stamp the @stratawp/vite-plugin version into the cli's templateDependencies.
// Templates declare workspace:*, which only resolves inside this monorepo;
// customize-theme.ts rewrites it on scaffold using this field, so the pin must
// track packages/vite-plugin instead of being hardcoded.
const cliPkgPath = join(cliRoot, 'package.json')
const cliPkg = JSON.parse(await readFile(cliPkgPath, 'utf8'))
const vitePluginPkg = JSON.parse(
  await readFile(join(cliRoot, '..', 'vite-plugin', 'package.json'), 'utf8')
)
const wanted = `^${vitePluginPkg.version}`
if (cliPkg.templateDependencies?.['@stratawp/vite-plugin'] !== wanted) {
  cliPkg.templateDependencies = {
    ...cliPkg.templateDependencies,
    '@stratawp/vite-plugin': wanted,
  }
  await writeFile(cliPkgPath, JSON.stringify(cliPkg, null, 2) + '\n')
  console.log(`sync-template-vendor: pinned @stratawp/vite-plugin ${wanted} in templateDependencies`)
}
