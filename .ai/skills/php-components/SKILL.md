---
description: Creating, registering, and extending StrataWP PHP theme components.
globs: packages/core/src/**/*.php, examples/*/inc/**/*.php, packages/cli/templates/*/inc/**/*.php
---

# PHP Components

StrataWP's PHP layer is component-based. Each unit of theme functionality is a class implementing `ComponentInterface`, registered with the `Theme` class.

## Scaffolding

Always scaffold rather than hand-rolling boilerplate:

```bash
stratawp component:new Analytics --type=feature
```

This generates a class in the theme's `inc/Components/` implementing the interface with the correct namespace and naming conventions.

## The Contract

```php
interface ComponentInterface {
    public function get_slug(): string;   // kebab-case identifier
    public function initialize(): void;   // add_action/add_filter registrations
}
```

- Keep constructors side-effect free; hook registrations belong in `initialize()`.
- Components exposing template tags implement `TemplatingComponentInterface` additionally.
- Slugs are kebab-case and unique across the theme.

## Registration

Themes construct the `Theme` singleton in `functions.php`:

```php
$theme = new \StrataWP\Theme([
    new \StrataWP\Components\Setup(),
    new \MyTheme\Components\Analytics(),
]);
$theme->initialize();
```

The constructor applies the `stratawp_theme_components` filter — the extension point for child themes and plugins to add, remove, or replace components without touching `functions.php`:

```php
add_filter('stratawp_theme_components', function (array $components): array {
    $components[] = new My_Custom_Component();
    return array_filter($components, fn($c) => $c->get_slug() !== 'analytics');
});
```

## Default Components (packages/core/src/Components/)

| Component           | Responsibility                                                   |
| ------------------- | ---------------------------------------------------------------- |
| `Setup`             | Theme supports, thumbnails, menus                                |
| `Assets`            | Enqueues from the Vite manifest                                  |
| `Blocks`            | Block registration and patterns                                  |
| `Performance`       | Filter-driven resource hints, async/defer, bloat removal         |
| `Accessibility`     | Skip-link focus fix, `aria-current` on nav, screen-reader styles |
| `ConditionalStyles` | Non-render-blocking per-page CSS via preload/onload swap         |
| `ImageSizes`        | Responsive `sizes` tuning for LCP/CLS                            |
| `Updates`           | GitHub-release-based theme update notifications                  |

## Distribution Rules (critical)

- `packages/core` is **not** on Packagist. Editing `packages/core/src/` is the source of truth.
- CLI templates carry a vendored snapshot (`packages/cli/templates/*/vendor/stratawp/core/`) refreshed automatically on `prepack` — **never edit the snapshot directly**.
- Derived production themes vendor core at `vendor/stratawp/core/src/` and update by copying — document core behavior changes in the changeset so downstream themes know to refresh.

## Quality Checklist

- Escaping and sanitization follow WordPress standards (`esc_html`, `esc_attr`, `wp_kses_post`, `sanitize_*`).
- New filters are prefixed `stratawp_` and documented in `CLAUDE.md` if public API.
- Run `pnpm lint:php` for theme-location PHP; match surrounding code style in core.
