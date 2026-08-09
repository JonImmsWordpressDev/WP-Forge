#!/usr/bin/env node
// StrataWP documentation MCP server (stdio transport, zero dependencies).
//
// Exposes the repository's documentation to MCP-capable AI agents:
//   - stratawp_docs_list    list all indexed documents
//   - stratawp_docs_search  keyword search with ranked snippets
//   - stratawp_docs_read    read a document by repo-relative path
//
// Run with: pnpm mcp:docs
// Register in an MCP client as: { "command": "node", "args": ["scripts/mcp-docs-server.mjs"] }
// Complements @stratawp/mcp (packages/mcp), which exposes generators + the component catalog.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, resolve, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const ROOT_DOCS = [
  'README.md',
  'CLAUDE.md',
  'AGENTS.md',
  'GETTING_STARTED.md',
  'CHEAT_SHEET.md',
  'CONTRIBUTING.md',
  'ROADMAP.md',
  'DEVELOPMENT_NOTES.md',
  'CHANGELOG.md',
]
const DOC_DIRS = ['.ai', 'docs', '.claude/skills']
const SKIP_DIRS = new Set(['node_modules', 'vendor', 'dist', 'build', '.git', '.turbo'])

function collectMarkdown(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    const stats = statSync(full)
    if (stats.isDirectory()) collectMarkdown(full, files)
    else if (entry.endsWith('.md')) files.push(full)
  }
  return files
}

function buildIndex() {
  const paths = []
  for (const file of ROOT_DOCS) {
    if (existsSync(join(root, file))) paths.push(join(root, file))
  }
  for (const dir of DOC_DIRS) {
    if (existsSync(join(root, dir))) collectMarkdown(join(root, dir), paths)
  }
  for (const scope of ['packages', 'examples']) {
    const scopeDir = join(root, scope)
    if (!existsSync(scopeDir)) continue
    for (const pkg of readdirSync(scopeDir)) {
      const readme = join(scopeDir, pkg, 'README.md')
      if (existsSync(readme)) paths.push(readme)
    }
  }
  return paths.map((full) => {
    const content = readFileSync(full, 'utf8')
    const heading = content.match(/^#\s+(.+)$/m)
    return {
      path: relative(root, full).split(sep).join('/'),
      title: heading ? heading[1].trim() : relative(root, full),
      content,
    }
  })
}

const index = buildIndex()

function searchDocs(query, maxResults = 8) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  const results = []
  for (const doc of index) {
    const lines = doc.content.split('\n')
    let score = 0
    const snippets = []
    lines.forEach((line, i) => {
      const lower = line.toLowerCase()
      const hits = terms.filter((t) => lower.includes(t)).length
      if (!hits) return
      // Weight lines matching more terms, headings, and title matches higher.
      score += hits * hits + (line.startsWith('#') ? 2 : 0)
      if (snippets.length < 3 && hits >= Math.min(terms.length, 2)) {
        snippets.push(`L${i + 1}: ${line.trim().slice(0, 200)}`)
      }
    })
    const titleLower = doc.title.toLowerCase()
    score += terms.filter((t) => titleLower.includes(t)).length * 10
    if (score > 0) results.push({ path: doc.path, title: doc.title, score, snippets })
  }
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ path, title, snippets }) => ({ path, title, snippets }))
}

const TOOLS = [
  {
    name: 'stratawp_docs_list',
    description: 'List all indexed StrataWP documentation files with their titles.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'stratawp_docs_search',
    description:
      'Search StrataWP documentation (guides, agent skills, package READMEs) by keywords. Returns ranked matches with file paths and line snippets.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Keywords to search for' } },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'stratawp_docs_read',
    description: 'Read a documentation file by its repo-relative path (as returned by list/search).',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Repo-relative documentation path' } },
      required: ['path'],
      additionalProperties: false,
    },
  },
]

function callTool(name, args) {
  if (name === 'stratawp_docs_list') {
    const listing = index.map((d) => `- ${d.path} — ${d.title}`).join('\n')
    return `${index.length} documents indexed:\n${listing}`
  }
  if (name === 'stratawp_docs_search') {
    const results = searchDocs(String(args?.query ?? ''))
    if (!results.length) return 'No matches found.'
    return results
      .map((r) => `## ${r.title}\npath: ${r.path}\n${r.snippets.join('\n')}`)
      .join('\n\n')
  }
  if (name === 'stratawp_docs_read') {
    const doc = index.find((d) => d.path === args?.path)
    if (!doc) throw new Error(`Unknown document: ${args?.path}. Use stratawp_docs_list to see valid paths.`)
    return doc.content
  }
  throw new Error(`Unknown tool: ${name}`)
}

function handle(message) {
  const { id, method, params } = message
  if (method === 'initialize') {
    return {
      protocolVersion: params?.protocolVersion ?? '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'stratawp-docs', version: '1.0.0' },
    }
  }
  if (method === 'ping') return {}
  if (method === 'tools/list') return { tools: TOOLS }
  if (method === 'tools/call') {
    try {
      const text = callTool(params?.name, params?.arguments)
      return { content: [{ type: 'text', text }], isError: false }
    } catch (error) {
      return { content: [{ type: 'text', text: String(error.message ?? error) }], isError: true }
    }
  }
  if (id === undefined) return undefined // unknown notification — ignore
  throw Object.assign(new Error(`Method not found: ${method}`), { code: -32601 })
}

const rl = createInterface({ input: process.stdin })
rl.on('line', (line) => {
  if (!line.trim()) return
  let message
  try {
    message = JSON.parse(line)
  } catch {
    process.stdout.write(
      JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }) + '\n'
    )
    return
  }
  // Notifications (no id) never receive a response.
  const isNotification = message.id === undefined
  try {
    const result = handle(message)
    if (!isNotification) {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: message.id, result }) + '\n')
    }
  } catch (error) {
    if (!isNotification) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: message.id,
          error: { code: error.code ?? -32603, message: String(error.message ?? error) },
        }) + '\n'
      )
    }
  }
})
