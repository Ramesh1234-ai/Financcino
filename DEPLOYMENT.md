# BrokTok Frontend Deployment Guide

## Overview
The BrokTok frontend is a Vite-based React application. Environment variables are required for:
- Backend API connectivity
- Clerk authentication

## Environment Variables Setup

### For Local Development
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your local values:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

### For Production Deployment

#### Option 1: Build with Environment Variables (Recommended)

Set environment variables before building:
```bash
export VITE_API_URL=https://api.yourproduction.com/api
export VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
npm run build
```

Or with `.env.production`:
```bash
# Create .env.production file with production values
VITE_API_URL=https://api.yourproduction.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY

npm run build
```

#### Option 2: Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your production API URL
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your production Clerk key
4. Vercel will automatically build and deploy

#### Option 3: Deploy to Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_API_URL`
   - `VITE_CLERK_PUBLISHABLE_KEY`
5. Deploy

#### Option 4: Deploy to Other Hosting (GitHub Pages, Firebase, etc.)

```bash
# Set your production environment variables
export VITE_API_URL=https://your-api-url.com/api
export VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY

# Build the production bundle
npm run build

# Output will be in ./dist directory
# Upload the ./dist folder to your hosting
```

## Verification

After deployment, verify the application works:
1. Check that API calls are reaching the correct backend URL
2. Test Clerk authentication functionality
3. Monitor browser console for any environment variable errors

### Debug Environment Variables

To see what environment variables are being used in your build:
```bash
npm run build -- --mode production --debug
```

Or add to `vite.config.js`:
```javascript
export default defineConfig({
  define: {
    __ENV__: JSON.stringify(process.env)
  }
})
```

## Troubleshooting

### "API requests failing" / "Cannot reach backend"
- ✓ Check `VITE_API_URL` is correct and accessible
- ✓ Ensure backend CORS is configured for your frontend URL
- ✓ Verify the environment variable was set before building

### "Clerk authentication not working"
- ✓ Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct
- ✓ Use test key for development (pk_test_...)
- ✓ Use production key for production (pk_live_...)
- ✓ Check that the URL domain is added to Clerk's allowed origins

### "Environment variables are undefined in browser"
- ✓ Ensure variables start with `VITE_` prefix (Vite requirement)
- ✓ Rebuild after changing environment variables
- ✓ Clear browser cache and dist folder: `rm -rf dist`

## CI/CD Pipeline Example

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: npm install
      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
      - uses: actions/upload-artifact@v2
        with:
          name: dist
          path: dist/
```

## Notes
- `.env` files are NOT tracked in git (see `.gitignore`)
- `.env.example` IS tracked as a reference template
- Always use secrets management for sensitive keys in CI/CD
