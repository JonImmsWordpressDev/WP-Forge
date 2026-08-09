#!/usr/bin/env node
// Generates instruction files for AI coding agents so they discover and
// follow the StrataWP agent protocol (AGENTS.md + .ai/). Zero dependencies.
//
// Usage:
//   pnpm ai:setup                 # interactive agent selection
//   pnpm ai:setup --all           # generate for every supported agent
//   pnpm ai:setup --agents=cursor,copilot
//   pnpm ai:setup --force         # overwrite existing files

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const CORE_INSTRUCTIONS = `# StrataWP — AI Agent Instructions

This repository uses a structured AI-assisted development workflow.

**Read \`AGENTS.md\` at the repository root and follow its protocol before making any changes.**

Core rules (full detail in AGENTS.md):

1. **Onboarding & state:** Check \`.ai/agent-state.md\`. If onboarding is pending, follow \`.ai/ONBOARDING.md\`. Always read \`.ai/PROJECT_RULES.md\` for learned repository conventions.
2. **pnpm only.** This is a Turborepo + pnpm workspace monorepo. Never use npm or yarn.
3. **Source files only.** Never edit \`dist/\`, generated files (\`inc/blocks-generated.php\`), or the vendored core snapshots under \`packages/cli/templates/*/vendor/\` — change \`packages/core/src/\` instead.
4. **Contract-first.** Non-trivial features require an approved spec in \`.ai/plans/\` (see \`.ai/skills/feature-planning/SKILL.md\`).
5. **Pre-flight check.** Run \`pnpm ai:check\` (lint, format, typecheck, unit tests) before submitting work.

Skill recipes live in \`.ai/skills/\` (see \`.ai/SKILLS.md\` for the directory) and WordPress domain skills in \`.claude/skills/\`. Run \`pnpm mcp:docs\` for documentation search via the Model Context Protocol; the \`@stratawp/mcp\` package exposes generators and the component catalog.
`

const AGENTS = {
  cursor: {
    label: 'Cursor',
    file: '.cursor/rules/stratawp.mdc',
    content: `---
description: StrataWP repository rules for AI-assisted development
alwaysApply: true
---

${CORE_INSTRUCTIONS}`,
  },
  copilot: {
    label: 'GitHub Copilot',
    file: '.github/copilot-instructions.md',
    content: CORE_INSTRUCTIONS,
  },
  gemini: {
    label: 'Gemini CLI',
    file: 'GEMINI.md',
    content: CORE_INSTRUCTIONS,
  },
  windsurf: {
    label: 'Windsurf',
    file: '.windsurf/rules/stratawp.md',
    content: CORE_INSTRUCTIONS,
  },
}

// Agents that need no generated file.
const NATIVE = [
  { label: 'Claude Code', note: 'reads CLAUDE.md (already present) and AGENTS.md' },
  { label: 'Codex / OpenCode / Jules', note: 'read AGENTS.md natively' },
]

function parseArgs(argv) {
  const opts = { all: false, force: false, agents: [] }
  for (const arg of argv) {
    if (arg === '--all' || arg === '-a') opts.all = true
    else if (arg === '--force' || arg === '-f') opts.force = true
    else if (arg.startsWith('--agents=')) {
      opts.agents = arg
        .slice('--agents='.length)
        .split(',')
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean)
    }
  }
  return opts
}

async function selectInteractive() {
  const keys = Object.keys(AGENTS)
  console.log('\nWhich AI coding agents should be configured?\n')
  keys.forEach((key, i) => {
    const target = existsSync(resolve(root, AGENTS[key].file)) ? ' (already configured)' : ''
    console.log(`  ${i + 1}. ${AGENTS[key].label}${target}`)
  })
  console.log(`  ${keys.length + 1}. All of the above\n`)
  for (const n of NATIVE) console.log(`  — ${n.label}: ${n.note}, no setup needed`)

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question('\nEnter numbers separated by commas (or press Enter to cancel): ')
  rl.close()

  const picks = answer
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= keys.length + 1)
  if (picks.includes(keys.length + 1)) return keys
  return picks.map((n) => keys[n - 1])
}

function writeAgentFile(key, force) {
  const agent = AGENTS[key]
  const target = resolve(root, agent.file)
  if (existsSync(target) && !force) {
    console.log(`  • ${agent.label}: ${agent.file} already exists — skipped (use --force to overwrite)`)
    return
  }
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, agent.content)
  console.log(`  ✓ ${agent.label}: wrote ${agent.file}`)
}

function verifyClaudePointer() {
  const claudeMd = resolve(root, 'CLAUDE.md')
  if (!existsSync(claudeMd)) return
  const content = readFileSync(claudeMd, 'utf8')
  if (!content.includes('AGENTS.md')) {
    console.log('  ! CLAUDE.md does not reference AGENTS.md — consider adding a pointer to the agent protocol.')
  }
}

const opts = parseArgs(process.argv.slice(2))
let selected = []
if (opts.all) selected = Object.keys(AGENTS)
else if (opts.agents.length) {
  selected = opts.agents.filter((a) => {
    if (!AGENTS[a]) {
      console.error(`  ! Unknown agent "${a}". Supported: ${Object.keys(AGENTS).join(', ')}`)
      return false
    }
    return true
  })
} else {
  selected = await selectInteractive()
}

if (!selected.length) {
  console.log('Nothing selected — no files written.')
  process.exit(0)
}

console.log('')
for (const key of selected) writeAgentFile(key, opts.force)
verifyClaudePointer()
console.log('\nDone. Agents should now read AGENTS.md and follow the onboarding protocol in .ai/ONBOARDING.md.')
