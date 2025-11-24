# WP-Forge Basic Theme

A complete example theme showcasing the WP-Forge framework.

## Features Demonstrated

✅ **Vite Integration**
- Lightning-fast HMR
- TypeScript support
- CSS preprocessing
- Optimized production builds

✅ **PHP Core Framework**
- Component-based architecture
- Custom components (Navigation, Customizer)
- Vite asset loading via manifest
- Performance optimizations

✅ **Custom Gutenberg Blocks**
- **Hero Block**: Full-width hero section with background image
- **Feature Card**: Showcase features with icons
- Auto-discovered and registered by Vite plugin

✅ **Modern Development**
- PHP 8.1+ with strict types
- TypeScript for JavaScript
- CSS custom properties
- Responsive design

## Installation

### 1. Install Dependencies

```bash
# Install Node dependencies
pnpm install

# Install PHP dependencies
composer install
```

### 2. Development

```bash
# Start Vite dev server
pnpm dev
```

Then activate the theme in WordPress admin. The Vite dev server will automatically inject HMR scripts when running locally.

### 3. Production Build

```bash
# Build for production
pnpm build
```

This generates optimized assets in the `dist/` directory.

## File Structure

```
basic-theme/
├── src/
│   ├── blocks/              # Gutenberg blocks
│   │   ├── hero/
│   │   └── feature-card/
│   ├── css/                 # Stylesheets
│   │   ├── main.css
│   │   └── editor.css
│   └── js/                  # JavaScript
│       ├── main.ts
│       └── editor.ts
├── inc/
│   └── Components/          # Custom PHP components
│       ├── Navigation.php
│       └── Customizer.php
├── parts/                   # Template parts
├── templates/               # Page templates
├── functions.php            # Theme initialization
├── vite.config.ts          # Vite configuration
└── composer.json           # PHP dependencies
```

## Custom Blocks

### Hero Block

Full-width hero section with:
- Background image upload
- Overlay opacity control
- Title, description, and CTA button
- Responsive design

### Feature Card

Service/feature showcase with:
- Custom icon (emoji or text)
- Icon background color picker
- Title and description
- Hover effects

## Customization

### Adding New Blocks

1. Create block directory in `src/blocks/`
2. Add `block.json` with metadata
3. Create `edit.tsx` for editor
4. Create `render.php` for frontend
5. Add `style.css` for styling

The Vite plugin will automatically discover and register it!

### Adding New Components

1. Create PHP class in `inc/Components/`
2. Implement `ComponentInterface`
3. Add to theme initialization in `functions.php`

### Styling

Edit `src/css/main.css` - uses CSS custom properties for easy theming.

## What Makes This Different?

Unlike traditional WordPress themes:
- ⚡ **Instant feedback** with HMR (even for PHP!)
- 🔄 **Auto block registration** (no manual PHP code)
- 📦 **Optimized builds** with tree-shaking and code-splitting
- 🎯 **Type-safe** with TypeScript
- 🏗️ **Modern architecture** with components

## Learn More

- [WP-Forge Documentation](https://github.com/JonImmsWordpressDev/WP-Forge)
- [Vite Documentation](https://vitejs.dev/)
- [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/)

---

Built with ⚒️ **WP-Forge**
