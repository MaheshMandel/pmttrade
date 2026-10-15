# PickMyTrade - Tradovate Automation Website

A high-performance static website for PickMyTrade's Tradovate automation platform.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Install dependencies
npm install
```

## 📦 Build Commands

### Tailwind CSS

The project uses `main.css` as the source file which includes:
- Tailwind CSS directives (`@tailwind base/components/utilities`)
- All custom styles (FAQ, animations, scrollbar, etc.)

```bash
# Build CSS for production (minified)
npm run build

# Watch for changes during development
npm run watch
```

### Manual Tailwind Commands

```bash
# Build minified CSS from main.css
npx tailwindcss -i main.css -o output.css --minify

# Watch mode (auto-rebuild on file changes)
npx tailwindcss -i main.css -o output.css --watch

# Build with verbose output
npx tailwindcss -i main.css -o output.css --minify --verbose
```

## 📁 Project Structure

```
tradovate-html-css/
├── index.html                    # Main landing page
├── tradingview-automation.html   # TradingView automation guide
├── supported-propfirms.html      # Supported prop firms page
├── 404.html                      # Error page
├── output.css                    # Compiled Tailwind CSS (generated)
├── style.css                     # Custom styles
├── script.js                     # Main JavaScript
├── pricing-config.json           # Dynamic pricing configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── package.json                  # Node.js dependencies
│
├── automation/                   # Prop firm automation guides
│   ├── tradovate-to-apex-trader-funding-automation.html
│   ├── tradovate-to-tradeify-automation.html
│   └── ... (8 files)
│
├── copier/                       # Trade copier guides
│   ├── tradovate-to-apex-trader-funding-copier.html
│   └── ... (8 files)
│
├── pages/                        # Static pages
│   ├── afiliateProgram.html
│   ├── contactUs.html
│   ├── privacy.html
│   ├── security.html
│   └── termsAndConditions.html
│
├── use-cases/                    # Use case pages
│   ├── algo-developers.html
│   ├── day-traders.html
│   ├── multi-account-traders.html
│   └── prop-traders.html
│
├── components/                   # Reusable components
│   ├── navbar.html               # Navigation bar
│   ├── navbar-loader.js          # Navbar dynamic loader
│   ├── footer.html               # Footer
│   ├── footer-loader.js          # Footer dynamic loader
│   └── deferred-scripts.js       # Deferred analytics loader
│
└── assets/                       # Images and static assets
    ├── logo.png
    └── ...
```

## ⚡ Performance Optimizations

This project uses several performance optimizations:

### CSS Loading
- **Pre-compiled Tailwind CSS** - No CDN dependency, faster load times
- **Non-blocking Font Awesome** - Uses `media="print"` trick for async loading
- **Non-blocking Google Fonts** - Same technique for custom fonts

### JavaScript Loading
- **Cloudflare Zaraz** - Google Analytics and Microsoft Clarity are loaded server-side at the edge for optimal performance
- **Deferred Scripts** - LiveAgent chat widget loads after page is interactive
- **requestIdleCallback** - Third-party scripts load during browser idle time

### Build Optimizations
- **Minified CSS** - Production builds use `--minify` flag
- **Tree-shaking** - Only used Tailwind utilities are included

## 🛠️ Development

### Adding New HTML Files

When adding new HTML pages:

1. Add the file path to `tailwind.config.js` content array
2. Rebuild CSS: `npm run build`
3. Include these in your HTML `<head>`:

```html
<!-- CSS -->
<link rel="stylesheet" href="./style.css" />
<link rel="stylesheet" href="./output.css" />

<!-- Non-blocking Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
  integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
  crossorigin="anonymous" referrerpolicy="no-referrer" media="print" onload="this.media='all'" />
```

4. Include navbar and footer components:

```html
<!-- Navbar -->
<div id="navbar-component"></div>
<script src="./components/navbar-loader.js"></script>

<!-- Footer (before </body>) -->
<div id="footer-component"></div>
<script src="./components/footer-loader.js"></script>

<!-- Deferred Scripts (last, before </body>) -->
<script src="./components/deferred-scripts.js" defer></script>
```

### Modifying Pricing

Edit `pricing-config.json` to update pricing plans. The pricing cards are dynamically generated from this configuration.

### Analytics Configuration (Cloudflare Zaraz)

Google Analytics and Microsoft Clarity are managed via **Cloudflare Zaraz** for better performance:

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Zaraz** → **Tools**
3. Configure your tracking IDs:
   - **Google Analytics 4**: `G-QQ4HYD0BM5`
   - **Google Ads**: `AW-16516604992`
   - **Microsoft Clarity**: `tnbkghoizf`

For LiveAgent chat widget, edit `components/deferred-scripts.js`

## 🔧 Tailwind Configuration

The `tailwind.config.js` scans these paths for utility classes:

```javascript
content: [
  './*.html',
  './pages/**/*.html',
  './automation/**/*.html',
  './copier/**/*.html',
  './use-cases/**/*.html',
  './components/**/*.{html,js}',
  './*.js'
]
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Build minified CSS for production |
| `npm run watch` | Watch and rebuild CSS on changes |
| `npm run optimize-images` | Convert PNG/JPG images to WebP format |
| `npm run update-html-webp` | Update HTML files to use WebP images |

## 🖼️ Image Optimization

The project includes scripts to convert images to WebP format for better performance:

```bash
# Step 1: Convert all images to WebP
npm run optimize-images

# Step 2: Update HTML files to use WebP
npm run update-html-webp
```

**Results:**
- Original: 386KB → WebP: 207KB (**46% smaller**)
- Major savings on prop firm logos and charts

## 🌐 Deployment

1. Run `npm run build` to generate production CSS
2. Upload all files to your web server
3. Ensure proper MIME types for `.css`, `.js`, and `.html` files

## 📄 License

Proprietary - PickMyTrade Pvt. Ltd. All rights reserved.
