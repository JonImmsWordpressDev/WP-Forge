---
description: Deploying StrataWP themes (SFTP/FTP/SSH), database sync, snapshots, and rollback.
globs: packages/cli/src/deployers/**/*, packages/cli/src/commands/deploy/**/*, packages/sync/**/*
---

# Deployment & Sync

StrataWP ships a full deployment and environment-sync system through the CLI. Agents should understand it to modify it safely — and should treat live deploys as **user-initiated actions only**.

> [!WARNING]
> Never run `stratawp deploy`, `sync:db:push`, or any command that mutates a remote environment unless the user explicitly asks for that exact operation in this session.

## Deployment Architecture (`packages/cli/src/deployers/`)

- `base.ts` — abstract lifecycle: connect → backup → upload → delete orphans → postDeploy → validate → disconnect.
- `ftp.ts` — SFTP (`ssh2-sftp-client`) and FTP (`basic-ftp`).
- `ssh.ts` — SSH/rsync (`node-ssh`) with post-deploy hooks (cache flush, OPcache reset, custom WP-CLI commands), validation (file checks, WP-CLI health, HTTP health), and backup auto-cleanup (`backup.keepLast`).

Config lives in `~/.stratawp/deploy-config.json` (global), `.stratawp-deploy.json` (project), and `.env` (credentials). Only `dist/`, PHP files, `theme.json`, `style.css`, and `vendor/` are deployed.

## Key Commands

```bash
stratawp deploy:setup                 # interactive configuration
stratawp deploy production            # deploy (creates pre-deploy snapshot)
stratawp deploy production --dry-run  # preview
stratawp deploy:test production       # connection test
stratawp sync:templates production --all   # FSE template sync via WP-CLI over SSH
stratawp sync:db:pull production      # pull remote DB with URL replacement
stratawp rollback:list                # snapshots
stratawp rollback:diff 1 2
```

## Sync System (`packages/sync/`)

- `database/dump.ts` / `restore.ts` — MySQL export/import with automatic pre-restore backup.
- `database/url-replace.ts` — URL replacement that correctly recalculates PHP serialized string lengths. **Any change here needs unit tests against serialized fixtures** — silent corruption is the failure mode.
- `snapshots/manager.ts` — pre-deploy snapshots (theme tar.gz + gzipped SQL) in `.stratawp-snapshots/`.
- `diff/index.ts` — file and SQL dump comparison.

## Modification Guidelines

1. **Lifecycle changes go in `base.ts`**; transport-specific behavior goes in the concrete deployer. Don't duplicate lifecycle logic per transport.
2. **Fail safe.** Any new deploy step must leave the remote in a recoverable state — respect the snapshot/backup flow and never skip the pre-deploy snapshot by default.
3. **Credentials never in code or logs.** Support env-var indirection as the existing config does; redact secrets in verbose output.
4. **FSE template sync** operates on database-stored Site Editor templates via WP-CLI over SSH — file deploys do not cover them, which is why `sync:templates` exists as a separate command.
