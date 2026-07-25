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

  it('references only pattern slugs it registers (wp:pattern refs resolve)', () => {
    // A wp:pattern block with an unknown slug renders nothing, silently —
    // frost/* leftovers from the theme the scaffold was forked from left
    // every affected template area empty on fresh scaffolds (issue #27).
    const registered = new Set<string>()
    for (const file of listTextFiles(path.join(templatePath, 'patterns'))) {
      const match = fs.readFileSync(file, 'utf-8').match(/^\s*\*\s*Slug:\s*(.+)$/m)
      if (match) {
        registered.add(match[1].trim())
      }
    }

    const unresolved: string[] = []
    for (const file of listTextFiles(templatePath)) {
      const content = fs.readFileSync(file, 'utf-8')
      for (const match of content.matchAll(/wp:pattern\s+\{"slug":"([^"]+)"/g)) {
        if (!registered.has(match[1])) {
          unresolved.push(`${path.relative(templatePath, file)}: ${match[1]}`)
        }
      }
    }

    expect(unresolved).toEqual([])
  })

  it('carries no trace of the forked-from Frost theme', () => {
    // The scaffold was forked from the Frost theme. Leftovers surfaced as
    // untranslatable 'frost'-domain strings, unresolvable frost/* pattern
    // slugs, unregistered frost-* categories, Frost-branded demo copy, and
    // attribution links — none of which belong in a scaffolded theme, so
    // the whole word is banned.
    const offenders: string[] = []
    for (const file of listTextFiles(templatePath)) {
      if (/frost/i.test(fs.readFileSync(file, 'utf-8'))) {
        offenders.push(path.relative(templatePath, file))
      }
    }

    expect(offenders).toEqual([])
  })

  it('declares only pattern categories that are core or registered by the template', () => {
    // Unknown categories in a pattern header are silently ignored, leaving
    // the pattern filed under no category in the inserter.
    const CORE_PATTERN_CATEGORIES = new Set([
      'about',
      'audio',
      'banner',
      'buttons',
      'call-to-action',
      'columns',
      'contact',
      'featured',
      'footer',
      'gallery',
      'header',
      'media',
      'portfolio',
      'posts',
      'query',
      'services',
      'team',
      'testimonials',
      'text',
      'video',
    ])

    // Registered by plugins the template depends on (store-theme requires
    // WooCommerce, which registers its own pattern category).
    const PLUGIN_PATTERN_CATEGORIES = new Set(['woocommerce'])

    const functionsPhp = fs.readFileSync(path.join(templatePath, 'functions.php'), 'utf-8')
    const registered = new Set(
      [...functionsPhp.matchAll(/register_block_pattern_category\(\s*'([^']+)'/g)].map((m) => m[1])
    )
    for (const category of PLUGIN_PATTERN_CATEGORIES) {
      registered.add(category)
    }

    const offenders: string[] = []
    for (const file of listTextFiles(path.join(templatePath, 'patterns'))) {
      const match = fs.readFileSync(file, 'utf-8').match(/^\s*\*\s*Categories:\s*(.+)$/m)
      if (!match) continue
      for (const category of match[1].split(',').map((c) => c.trim())) {
        if (!CORE_PATTERN_CATEGORIES.has(category) && !registered.has(category)) {
          offenders.push(`${path.relative(templatePath, file)}: ${category}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })

  it('defines every custom property its SCSS consumes', () => {
    // var(--color-accent) with no definition anywhere resolves to nothing —
    // the focus outline built on it was invisible, a WCAG 2.4.7 failure
    // (issue #29). WordPress-generated properties (--wp--*) are exempt.
    const defined = new Set<string>()
    const usages: Array<{ file: string; token: string }> = []
    for (const file of listTextFiles(path.join(templatePath, 'src', 'scss'))) {
      const content = fs.readFileSync(file, 'utf-8')
      for (const match of content.matchAll(/(?:^|[\s{;])--([a-z0-9-]+)\s*:/gm)) {
        defined.add(match[1])
      }
      for (const match of content.matchAll(/var\(\s*--([a-z0-9-]+)/g)) {
        usages.push({ file: path.relative(templatePath, file), token: match[1] })
      }
    }

    const offenders = [
      ...new Set(
        usages
          .filter((u) => !u.token.startsWith('wp--') && !defined.has(u.token))
          .map((u) => `${u.file}: --${u.token}`)
      ),
    ]

    expect(offenders).toEqual([])
  })

  it('aliases the legacy color tokens to theme.json presets, not literals', () => {
    // Hardcoded values here shadow whatever palette the user defines in
    // theme.json — the blue-link default scaffold look (issue #29).
    const variables = fs.readFileSync(
      path.join(templatePath, 'src', 'scss', '_variables.scss'),
      'utf-8'
    )

    const offenders: string[] = []
    for (const token of ['base', 'contrast', 'primary', 'secondary', 'neutral']) {
      const match = variables.match(new RegExp(`--color-${token}\\s*:\\s*([^;]+);`))
      if (!match || !match[1].includes(`--wp--preset--color--${token}`)) {
        offenders.push(`--color-${token}: ${match ? match[1].trim() : '(missing)'}`)
      }
    }

    expect(offenders).toEqual([])
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
