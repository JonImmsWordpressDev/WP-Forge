import { describe, it, expect } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { SKIP_DIRS } from './utils/theme-tokens.js'

/**
 * Scaffold lint for the bundled theme templates (issue #31).
 *
 * Each template must use exactly one slug token — hyphenated for text
 * domains, pattern/block namespaces ('strata-basic') and underscored for
 * PHP function prefixes ('strata_basic'). Residue from another template
 * (files copied between templates without renaming) produces themes whose
 * strings can never load translations, because WordPress only loads the
 * domain declared in style.css.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatesDir = path.join(__dirname, '..', 'templates')

const TEMPLATES = {
  'basic-theme': 'strata-basic',
  'advanced-theme': 'strata-advanced',
  'store-theme': 'strata-store',
} as const

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

function listTextFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        results.push(...listTextFiles(fullPath))
      }
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      results.push(fullPath)
    }
  }
  return results
}

describe.each(Object.entries(TEMPLATES))('%s template', (templateName, ownToken) => {
  const templatePath = path.join(templatesDir, templateName)

  it('declares its own token as the Text Domain in style.css', () => {
    const styleCss = fs.readFileSync(path.join(templatePath, 'style.css'), 'utf-8')
    const match = styleCss.match(/^Text Domain:\s*(.+)$/m)
    expect(match?.[1].trim()).toBe(ownToken)
  })

  it('contains no slug tokens from other templates', () => {
    const foreignTokens = Object.values(TEMPLATES)
      .filter((token) => token !== ownToken)
      .flatMap((token) => [token, token.replace(/-/g, '_')])

    const offenders: string[] = []
    for (const file of listTextFiles(templatePath)) {
      const content = fs.readFileSync(file, 'utf-8')
      for (const token of foreignTokens) {
        if (content.includes(token)) {
          offenders.push(`${path.relative(templatePath, file)}: ${token}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })
})
