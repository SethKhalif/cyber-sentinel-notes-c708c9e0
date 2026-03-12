# How to Replace Your Favicon

Your website's tab icon has been set to custom SVG files. Follow these steps to replace them with your own logo:

## Option 1: Quick Replace (Recommended)

1. **Create your custom favicon image** (transparent background recommended):
   - Size: 512x512 pixels minimum
   - Format: PNG, SVG, or JPG
   - Save as `favicon.png` or `favicon.svg`

2. **Replace the files in the `/public` folder**:
   - `favicon.svg` - Main favicon (all sizes)
   - `favicon-32x32.svg` - 32x32 icon variant
   - `favicon-16x16.svg` - 16x16 icon variant

3. **Update `index.html`** (if using PNG instead of SVG):
   ```html
   <!-- If using PNG -->
   <link rel="icon" type="image/png" href="/favicon.png" />
   <link rel="shortcut icon" href="/favicon.png" />
   <link rel="apple-touch-icon" href="/favicon.png" />
   ```

## Option 2: Generate from your logo

Use an online favicon generator:
- [favicon.io](https://favicon.io) - Upload your logo → generates all sizes
- [favicon-generator.org](https://www.favicon-generator.org) - Batch convert images
- [realfavicongenerator.net](https://realfavicongenerator.net) - Professional favicon generation

Then copy the generated files to `/public`:
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`

And update `index.html`:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

## Current Setup

Your favicon files are located in `/public/`:
- `favicon.svg` - Main SVG favicon (scalable, recommended)
- `favicon-16x16.svg` - Small icon
- `favicon-32x32.svg` - Medium icon

## Verify Changes

After replacing the favicon:
1. Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Check that the tab icon and bookmarks now show your custom image

## For Lovable Deployment

When you deploy to Lovable:
1. Ensure favicon files are in `/public` folder
2. Commit the changes to GitHub
3. Lovable will automatically include them in the deployment

The favicon will be served from your domain: `https://yourdomain.com/favicon.svg`

---

**Need help?** See the DEPLOYMENT.md file for more information on hosting your site with your domain!
