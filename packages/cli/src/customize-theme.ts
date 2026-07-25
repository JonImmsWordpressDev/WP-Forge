import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { TEMPLATE_TOKENS, replaceThemeTokens } from './utils/theme-tokens.js'

export interface ThemeConfig {
  name: string
  slug: string
  description: string
  author: string
  template: 'basic' | 'advanced' | 'store' | 'minimal'
  cssFramework: 'vanilla' | 'tailwind' | 'unocss' | 'panda'
  typescript: boolean
  testing: boolean
}

export async function customizeTheme(themePath: string, config: ThemeConfig) {
  // Stamp the user's slug over the template's canonical token everywhere —
  // text domains, pattern slugs, block namespaces, PHP function prefixes.
  // WordPress only loads translations for the domain declared in style.css,
  // so any file left on the template token would be untranslatable (#31).
  const templateToken = TEMPLATE_TOKENS[config.template]
  if (templateToken && templateToken !== config.slug) {
    await replaceThemeTokens(themePath, templateToken, config.slug)
  }

  // Update style.css with user's theme info
  const styleCssPath = path.join(themePath, 'style.css')
  if (await fs.pathExists(styleCssPath)) {
    let styleContent = await fs.readFile(styleCssPath, 'utf-8')

    // Replace theme metadata
    styleContent = styleContent
      .replace(/Theme Name:.*$/m, `Theme Name: ${config.name}`)
      .replace(/Description:.*$/m, `Description: ${config.description}`)
      .replace(/Author:.*$/m, `Author: ${config.author}`)
      .replace(/Text Domain:.*$/m, `Text Domain: ${config.slug}`)

    await fs.writeFile(styleCssPath, styleContent)
  }

  // Update package.json with user's info
  const packageJsonPath = path.join(themePath, 'package.json')
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath)
    packageJson.name = config.slug
    packageJson.description = config.description
    packageJson.author = config.author

    // Replace workspace dependencies with npm versions
    if (packageJson.devDependencies) {
      if (packageJson.devDependencies['@stratawp/vite-plugin'] === 'workspace:*') {
        packageJson.devDependencies['@stratawp/vite-plugin'] = '^0.2.0'
      }
    }

    // Add StrataWP metadata for update tracking
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const cliPackageJson = await fs.readJson(path.join(__dirname, '..', 'package.json'))
    packageJson.stratawp = {
      createdWith: cliPackageJson.version,
      template: config.template,
      createdAt: new Date().toISOString(),
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
  }

  // Update README.md
  const readmePath = path.join(themePath, 'README.md')
  if (await fs.pathExists(readmePath)) {
    let readmeContent = await fs.readFile(readmePath, 'utf-8')
    // Replace the first heading with the new theme name
    readmeContent = readmeContent.replace(/^#\s+.*$/m, `# ${config.name}`)
    await fs.writeFile(readmePath, readmeContent)
  }

  // Update vite.config.ts namespace if it exists
  const viteConfigPath = path.join(themePath, 'vite.config.ts')
  if (await fs.pathExists(viteConfigPath)) {
    let viteConfig = await fs.readFile(viteConfigPath, 'utf-8')
    viteConfig = viteConfig.replace(/namespace:\s*['"][\w-]+['"]/, `namespace: '${config.slug}'`)
    await fs.writeFile(viteConfigPath, viteConfig)
  }
}
