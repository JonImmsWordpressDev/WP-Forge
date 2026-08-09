import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * Read the CLI version from package.json at runtime.
 *
 * Works from both src/ (tests) and the bundled dist/ output because
 * both directories sit one level below the package root.
 */
export function getCliVersion(): string {
  const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version: string }
  return packageJson.version
}
