---
description: Deploying this theme safely with the StrataWP CLI.
globs: .stratawp-deploy.json, dist/**/*
---

# Deployment

This theme deploys with the StrataWP CLI (SFTP/FTP/SSH with pre-deploy snapshots).

> [!WARNING]
> Deploys mutate a live site. Never run `stratawp deploy`, `sync:db:push`, or any remote-mutating command unless the user explicitly asks for that exact operation in this session. Always prefer `--dry-run` first.

## Commands

```bash
stratawp deploy:setup                  # one-time interactive configuration
stratawp deploy:test production        # connection test (safe)
stratawp deploy production --dry-run   # preview what would change (safe)
stratawp deploy production             # real deploy (asks for confirmation)
stratawp sync:templates production --all   # push Site Editor templates (stored in DB, not files)
stratawp rollback:list                 # snapshots (deploys auto-snapshot first)
```

## What Ships

Only production files deploy: `dist/`, PHP files, `theme.json`, `style.css`, `vendor/`. Source (`src/`), `node_modules/`, and dev files (including `.ai/` and `AGENTS.md`) never ship.

## Rules

1. **Build before deploy** (`pnpm build`) unless using the CLI's built-in build step.
2. **Dry-run first, always.** Read the file list; if anything unexpected appears, stop and show the user.
3. **Site Editor template changes live in the database**, not in `templates/*.html` — file deploys don't move them. Use `stratawp sync:templates` for those.
4. **Credentials** live in the deploy config / `.env` — never inline them in commands, code, or logs.
5. If something breaks post-deploy, snapshots exist: `stratawp rollback:list` / `rollback:diff` — but restoring is the user's call, not yours.
