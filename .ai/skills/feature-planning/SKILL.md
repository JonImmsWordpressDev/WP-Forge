---
description: Contract-first approach for planning new StrataWP features before writing code.
globs: .ai/plans/**/*.md, packages/**/*, examples/**/*
---

# Feature Planning: Contract-First Strategy

This skill guides the agent through a contract-first planning process. It ensures there is a clear, agreed-upon technical plan before any code is written or files are modified.

## The Core Philosophy

1. **Contract establishment.** Do not create or modify source files for a non-trivial feature until a spec in `.ai/plans/` is finalized and approved by the user.
2. **Challenge the request.** StrataWP is opinionated (TypeScript-first, component-based PHP, filter-driven extensibility, pnpm-only). If a request violates the architecture — e.g., hardcoding what a filter should provide, editing generated files, adding a non-workspace dependency — surface your concern immediately with an alternative.
3. **Reuse before building.** Check whether an existing component, CLI generator, filter, or package already covers the need before planning new code.
4. **Three lenses.** Evaluate every feature through:
   - **Architecture:** Where does it live in the monorepo? ([Architecture skill](../architecture/SKILL.md))
   - **Quality:** How is it linted, typed, and tested? ([Code Quality skill](../code-quality/SKILL.md), [Testing skill](../testing/SKILL.md))
   - **Planning:** How is the contract defined and verified? (this skill)

## The Process

### Step 1: Clarification Rounds

Before drafting the specification, ask the user structured questions to define the "What" and the "How".

- **One focused question at a time**, targeting the highest-impact unknown.
- **Re-scan context** after each answer — the codebase, `.ai/PROJECT_RULES.md`, and relevant skills.
- **Self-assess confidence** (0–100%) for implementing the feature within StrataWP standards after each answer.
- **The 95% threshold:** continue the loop until implementation confidence exceeds **95%**.
- When the threshold is reached, present an **Echo Check**: summarize the technical contract, state your confidence, and ask for agreement before drafting the formal spec.

Key areas to explore:

- **Business value:** What problem is solved, and for whom (framework user, theme developer, site visitor)?
- **Placement:** Which package(s)? Does it belong in core PHP, the Vite plugin, the CLI, or a theme template?
- **Scaffolding:** Can `stratawp component:new` / `block:new` / `template:new` produce the starting point?
- **Distribution impact:** Does a core PHP change affect the vendored template snapshots? Does a package change need a changeset?
- **Constraints:** Accessibility (CI enforces WCAG 2.1 A/AA), performance, back-compat with derived themes.

### Step 2: Draft the Specification

Create `.ai/plans/{YYYY-MM-DD}-{feature-slug}.md` from [SPEC-TEMPLATE.md](../../plans/SPEC-TEMPLATE.md). It must include the mission statement, architectural fit, user stories, success metrics, and the technical plan (scaffolding commands, implementation steps, verification).

### Step 3: Refinement

Present the draft spec to the user and iterate. Only proceed to implementation after the user confirms the contract. Mark the spec **Approved** with the date.

## Best Practices

- **Zero presumption:** never assume a file path or API name until it is documented in the spec.
- **Reference skills:** link relevant `.ai/skills/` and `.claude/skills/` recipes inside the technical plan.
- **Fail early:** if the request is not feasible within the architecture, identify this during planning, not mid-implementation.
- **Keep plans together:** related planning documents live in the same `.ai/plans/` entry. Long-form design history lives in `docs/plans/` — check it for prior art before planning.
