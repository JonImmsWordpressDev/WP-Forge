---
'@stratawp/cli': minor
---

Theme templates now ship an AI-assisted development workflow out of the box. Every scaffolded theme includes `AGENTS.md` (the agent protocol), a `.ai/` directory (onboarding, self-learning project rules, agent state, developer directions, spec template, and skills for architecture, blocks & patterns, and deployment), `.aiignore`, and a zero-dependency `pnpm ai:setup` command that generates instruction files for Claude Code, Cursor, GitHub Copilot, Gemini CLI, and Windsurf. A `pnpm ai:check` pre-flight script is wired into each template, and a new test suite enforces that all templates carry the scaffold.
