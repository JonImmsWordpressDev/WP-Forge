/**
 * Theme slug token stamping for scaffolded themes (issue #31).
 *
 * Each bundled template uses one canonical slug token — hyphenated for the
 * text domain and pattern/block namespaces ('strata-basic'), underscored for
 * PHP function prefixes ('strata_basic'). When a theme is scaffolded, both
 * variants must be replaced with the user's slug everywhere, not just in
 * style.css: WordPress only loads translations for the domain declared in
 * style.css, so any call site left on the template token is untranslatable.
 */
import fs from 'fs-extra'
import path from 'path'

/** Canonical slug token for each copyable template. */
export const TEMPLATE_TOKENS: Record<string, string> = {
  basic: 'strata-basic',
  advanced: 'strata-advanced',
  store: 'strata-store',
}

/** Directories that never contain theme source to stamp or lint. */
export const SKIP_DIRS = new Set(['node_modules', 'vendor', 'dist', '.git', '.turbo'])

const TEXT_EXTENSIONS = new Set([
  '.php',
  '.css',
  '.scss',
  '.json',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.cts',
  '.html',
  '.md',
  '.txt',
])

/** Derive a PHP-identifier-safe prefix from a theme slug. */
export function phpIdentifier(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9_]/g, '_')
}

/**
 * Replace every occurrence of the template's slug token (and its underscore
 * variant) with the user's slug across all text files in the theme.
 */
export async function replaceThemeTokens(
  themePath: string,
  templateToken: string,
  slug: string
): Promise<void> {
  const replacements: Array<[string, string]> = [
    [templateToken, slug],
    [templateToken.replace(/-/g, '_'), phpIdentifier(slug)],
  ]

  for (const filePath of await listTextFiles(themePath)) {
    const content = await fs.readFile(filePath, 'utf-8')
    let updated = content
    for (const [from, to] of replacements) {
      updated = updated.split(from).join(to)
    }
    if (updated !== content) {
      await fs.writeFile(filePath, updated)
    }
  }
}

async function listTextFiles(dir: string): Promise<string[]> {
  const results: string[] = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        results.push(...(await listTextFiles(fullPath)))
      }
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      results.push(fullPath)
    }
  }
  return results
}
