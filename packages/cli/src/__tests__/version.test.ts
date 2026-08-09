import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { getCliVersion } from '../version'

const pkgPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

describe('getCliVersion', () => {
  it('returns the version declared in package.json', () => {
    expect(getCliVersion()).toBe(pkg.version)
  })

  it('returns a semver string', () => {
    expect(getCliVersion()).toMatch(/^\d+\.\d+\.\d+/)
  })
})
