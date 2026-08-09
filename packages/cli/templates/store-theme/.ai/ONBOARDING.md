# AI Agent Onboarding Guide

This guide gets you up to speed with this StrataWP theme efficiently, without redundant setup work.

## 🚀 The Onboarding Workflow

### Step 1: Check Agent State

Check `.ai/agent-state.md`.

- **If Onboarding Status is "Completed"**: Stop! Do NOT run setup or re-explore. Proceed directly to the user's task.
- **If Onboarding Status is "Pending"**: Continue below.

### Step 2: Initialize AI Setup (First-Time Only)

If your agent-specific configuration file (e.g. `CLAUDE.md`, `.cursor/rules/`, `GEMINI.md`, `.github/copilot-instructions.md`) does not exist:

1. Explain that you are running the setup command.
2. Run `pnpm ai:setup` and select your agent (or pass `--agents=<name>`).

### Step 3: Read Developer Directions

Read `.ai/developer-directions.md` — the theme developer's standing rules for design, code style, and priorities. You **MUST** adhere to everything in it.

### Step 4: Map the Theme & Initialize Project Rules

1. Read `theme.json` — design tokens, palettes, typography, spacing.
2. Read `functions.php` — which StrataWP components are registered.
3. Read `vite.config.ts` — entry points and build options.
4. Skim `templates/`, `parts/`, `patterns/`, and `src/blocks/` to see what exists.
5. Record your findings in the **Discovered Theme Configuration** section of `.ai/PROJECT_RULES.md`.

### Step 5: Update Agent State

Update `.ai/agent-state.md`: set Status to Completed, record your agent name and the date, check off the completed steps, and add an Agent Log entry.

---

## 🛠️ Key Resources

1. **Project Rules** (`.ai/PROJECT_RULES.md`) — running log of conventions and decisions. Check it frequently.
2. **Skills** (`.ai/skills/`) — recipes for architecture, blocks & patterns, and deployment.
3. **Scaffolding** — `stratawp block:new`, `stratawp component:new`, `stratawp template:new`, `stratawp part:new`.
4. **Verification** — `pnpm ai:check` before submitting any work.
