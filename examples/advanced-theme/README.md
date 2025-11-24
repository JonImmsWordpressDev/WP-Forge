# WP-Forge Advanced Theme

A comprehensive, feature-rich Block Theme (FSE) showcasing all WP-Forge capabilities. Perfect for business, e-commerce, portfolio, and blog sites.

## Features

### Block Theme (Full Site Editing)
- Visual Site Editor with complete control
- Edit all templates and template parts in the admin
- Global styles and design system via theme.json
- No need to touch code (but you can!)

### Custom Post Types
- **Portfolio** - Showcase projects with categories and tags
- **Testimonials** - Display client feedback with styled layouts
- **Team** - Manage team members with departments
- Each CPT has custom single and archive templates

### Templates Included
- Index, Single, Page, Archive, 404
- Portfolio (single + archive with grid layout)
- Team (single with bio layout + archive grid)
- Testimonials (single with styled quote card)

### WooCommerce Integration
- Full e-commerce support
- Custom product gallery features
- Theme-optimized styling

### Navigation
5 menu locations:
- Primary, Top Bar, Footer, Mobile, Social Links

### Modern Development
- TypeScript + Vite build system
- Hot Module Replacement (HMR)
- Custom Gutenberg blocks
- Performance optimized

### Accessibility
- WCAG 2.1 Level AAA compliant
- 48px minimum touch targets
- Proper ARIA labels
- Keyboard navigation

## Installation

1. Clone to your themes directory
2. Install dependencies:
   ```bash
   composer install
   pnpm install
   ```
3. Build assets:
   ```bash
   pnpm build
   ```
4. Activate in WordPress

## Using the Site Editor

### Edit Everything Visually
1. Go to **Appearance → Editor**
2. Browse templates by type (posts, pages, CPTs)
3. Edit template parts (header, footer)
4. Customize global styles (colors, fonts, spacing)
5. All changes save automatically

### Custom Post Types
After activation, you'll see in your admin:
- **Portfolio** menu item
- **Testimonials** menu item  
- **Team** menu item

Add content and it will use the custom templates automatically!

## Development

```bash
pnpm dev    # Start dev server with HMR
pnpm build  # Build for production
```

## File Structure

```
advanced-theme/
├── theme.json              # Design system
├── templates/              # Block templates
│   ├── index.html
│   ├── single.html
│   ├── page.html
│   ├── archive.html
│   ├── 404.html
│   ├── single-portfolio.html
│   ├── archive-portfolio.html
│   ├── single-team.html
│   ├── archive-team.html
│   └── single-testimonial.html
├── parts/                  # Template parts
│   ├── header.html
│   └── footer.html
├── inc/Components/         # PHP components
│   ├── CustomPostTypes.php
│   ├── WooCommerce.php
│   ├── Navigation.php
│   └── Customizer.php
└── src/                    # Assets
    ├── blocks/
    ├── css/
    └── js/
```

## Use Cases

This theme is designed for:
- **Business/Corporate** - Professional services, agencies
- **E-commerce** - Online stores with WooCommerce
- **Portfolio** - Showcase creative work
- **Blog/Magazine** - Content-rich sites
- **Multi-purpose** - Flexible for any need

## Requirements

- PHP 8.1+
- WordPress 6.0+
- Node.js 18+
- Composer

## License

GPL-3.0-or-later

Built with WP-Forge by Jon Imms
