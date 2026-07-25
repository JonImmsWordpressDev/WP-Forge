import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { TEMPLATE_TOKENS, phpIdentifier, replaceThemeTokens } from '../theme-tokens.js'

describe('TEMPLATE_TOKENS', () => {
  it('maps every copyable template to its canonical slug token', () => {
    expect(TEMPLATE_TOKENS).toEqual({
      basic: 'strata-basic',
      advanced: 'strata-advanced',
      store: 'strata-store',
    })
  })
})

describe('phpIdentifier', () => {
  it('converts hyphens to underscores', () => {
    expect(phpIdentifier('my-cool-theme')).toBe('my_cool_theme')
  })

  it('replaces characters invalid in PHP identifiers', () => {
    expect(phpIdentifier('my.theme2')).toBe('my_theme2')
  })
})

describe('replaceThemeTokens', () => {
  let themePath: string

  beforeEach(async () => {
    themePath = await fs.mkdtemp(path.join(os.tmpdir(), 'stratawp-tokens-'))

    await fs.writeFile(
      path.join(themePath, 'style.css'),
      '/*\nTheme Name: Basic\nText Domain: strata-basic\n*/\n'
    )
    await fs.writeFile(
      path.join(themePath, 'functions.php'),
      '<?php\nfunction strata_basic_setup() {\n' +
        "    esc_html__( 'PHP Version Error', 'strata-basic' );\n}\n"
    )
    await fs.outputFile(
      path.join(themePath, 'patterns/hero.php'),
      '<?php\n/**\n * Title: Hero\n * Slug: strata-basic/hero\n */\n?>\n' +
        '<!-- wp:pattern {"slug":"strata-basic/header-default"} /-->\n'
    )
    await fs.outputJson(path.join(themePath, 'src/blocks/hero/block.json'), {
      name: 'strata-basic/hero',
      textdomain: 'strata-basic',
    })
    await fs.outputFile(
      path.join(themePath, 'templates/index.html'),
      '<!-- wp:pattern {"slug":"strata-basic/posts"} /-->\n'
    )
    // Directories the walk must never descend into
    await fs.outputFile(
      path.join(themePath, 'node_modules/dep/index.js'),
      "module.exports = 'strata-basic'\n"
    )
    await fs.outputFile(path.join(themePath, 'vendor/lib/lib.php'), '<?php // strata-basic\n')
    // Non-text file that must pass through untouched
    await fs.writeFile(path.join(themePath, 'screenshot.png'), Buffer.from('strata-basic\x00\x01'))
  })

  afterEach(async () => {
    await fs.remove(themePath)
  })

  it('stamps the theme slug into every text-domain and namespace call site', async () => {
    await replaceThemeTokens(themePath, 'strata-basic', 'my-theme')

    const styleCss = await fs.readFile(path.join(themePath, 'style.css'), 'utf-8')
    expect(styleCss).toContain('Text Domain: my-theme')

    const functionsPhp = await fs.readFile(path.join(themePath, 'functions.php'), 'utf-8')
    expect(functionsPhp).toContain("esc_html__( 'PHP Version Error', 'my-theme' )")
    expect(functionsPhp).toContain('function my_theme_setup()')

    const pattern = await fs.readFile(path.join(themePath, 'patterns/hero.php'), 'utf-8')
    expect(pattern).toContain('* Slug: my-theme/hero')
    expect(pattern).toContain('{"slug":"my-theme/header-default"}')

    const blockJson = await fs.readJson(path.join(themePath, 'src/blocks/hero/block.json'))
    expect(blockJson.name).toBe('my-theme/hero')
    expect(blockJson.textdomain).toBe('my-theme')

    const indexHtml = await fs.readFile(path.join(themePath, 'templates/index.html'), 'utf-8')
    expect(indexHtml).toContain('{"slug":"my-theme/posts"}')
  })

  it('leaves no template token behind in any text file', async () => {
    await replaceThemeTokens(themePath, 'strata-basic', 'my-theme')

    const checkDir = async (dir: string): Promise<void> => {
      for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === 'vendor') continue
          await checkDir(fullPath)
        } else if (path.extname(entry.name) !== '.png') {
          const content = await fs.readFile(fullPath, 'utf-8')
          expect(content, fullPath).not.toContain('strata-basic')
          expect(content, fullPath).not.toContain('strata_basic')
        }
      }
    }
    await checkDir(themePath)
  })

  it('does not descend into node_modules or vendor', async () => {
    await replaceThemeTokens(themePath, 'strata-basic', 'my-theme')

    const dep = await fs.readFile(path.join(themePath, 'node_modules/dep/index.js'), 'utf-8')
    expect(dep).toContain('strata-basic')
    const vendorLib = await fs.readFile(path.join(themePath, 'vendor/lib/lib.php'), 'utf-8')
    expect(vendorLib).toContain('strata-basic')
  })

  it('leaves non-text files byte-for-byte untouched', async () => {
    await replaceThemeTokens(themePath, 'strata-basic', 'my-theme')

    const png = await fs.readFile(path.join(themePath, 'screenshot.png'))
    expect(png.equals(Buffer.from('strata-basic\x00\x01'))).toBe(true)
  })
})
