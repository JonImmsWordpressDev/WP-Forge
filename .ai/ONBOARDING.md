# StrataWP AI Agent Onboarding Guide

Welcome, AI Developer! This guide gets you up to speed with StrataWP efficiently and safely, without wasting tokens, time, or redundant setup work.

## 🚀 The Onboarding Workflow

When you first enter this workspace, or after a context reset, follow this protocol:

### Step 1: Check Agent State

Check the `.ai/agent-state.md` file.

- **If Onboarding Status is already "Completed"**: Stop! Do NOT run setup or perform initial exploration. Proceed directly to the user's task.
- **If Onboarding Status is "Pending"**: Proceed to Step 2.

### Step 2: Initialize AI Setup (First-Time Only)

If your agent-specific configuration file (e.g. `CLAUDE.md` for Claude Code, `.cursor/rules/` for Cursor, `GEMINI.md` for Gemini CLI, `.github/copilot-instructions.md` for Copilot) does not exist in the repository:

1. Explain that you are running the setup command to configure your files.
2. Run `pnpm ai:setup` and select your agent from the list (or pass `--agents=<name>`).
3. This writes a compact instruction file for your agent that points back to `AGENTS.md`.

Agents that read `AGENTS.md` natively (Codex, OpenCode, and others following the AGENTS.md convention) need no extra file.

### Step 3: Read Developer Directions

Open and read `.ai/developer-directions.md`. This file contains project-specific guidelines, priorities, and constraints set by the framework maintainer. You **MUST** strictly adhere to any rules found there.

### Step 4: Map the Workspace & Initialize Project Rules

Analyze the repository to understand its configuration:

1. Read `CLAUDE.md` for the canonical package map, commands, and conventions.
2. Read `turbo.json` and `pnpm-workspace.yaml` to understand the monorepo pipeline.
3. Skim `packages/core/src/Theme.php` and one example theme (`examples/basic-theme/`) to understand the PHP component architecture and FSE structure.
4. Open `.ai/PROJECT_RULES.md` and fill out (or verify) the **Discovered Repository Configuration** section with your findings. This bootstraps the self-learning memory for future agents!

### Step 5: Update Agent State

Once the above steps are complete, update `.ai/agent-state.md` with:

- **Status**: Completed
- **Last Agent**: [Your Agent Name]
- **Last Updated**: [Current Date]
- Under **Completed Steps**, check off all the completed tasks.
- Add an entry under **Agent Log** noting your onboarding and any `.ai/PROJECT_RULES.md` initialization.

---

## 🛠️ Key Developer Resources

To ensure your work aligns with StrataWP's engineering standards, always use these resources:

1. **Project Rules (`.ai/PROJECT_RULES.md`)**
   - The active running log of discovered guidelines, local patterns, and major architectural decisions made during development. Check this frequently!
2. **AI Agent Skills (`.ai/skills/`)**
   - Step-by-step recipes for common tasks (e.g., [Feature Planning](skills/feature-planning/SKILL.md), [Architecture](skills/architecture/SKILL.md), [Gutenberg Blocks](skills/gutenberg-blocks/SKILL.md)).
3. **WordPress Domain Skills (`.claude/skills/`)**
   - Deep WordPress knowledge (blocks, theme.json, REST API, WP-CLI, performance, PHPStan). Route via `.claude/skills/wordpress-router/SKILL.md`.
4. **Documentation Search (MCP)**
   - Run `pnpm mcp:docs` to search and retrieve repository documentation via the integrated Model Context Protocol server. (The separate `@stratawp/mcp` package exposes generators and the component catalog.)
5. **Automated Tooling**
   - Use `stratawp component:new` / `stratawp block:new` to scaffold new code.
   - Use `pnpm ai:check` before submitting any PR to validate coding standards.
