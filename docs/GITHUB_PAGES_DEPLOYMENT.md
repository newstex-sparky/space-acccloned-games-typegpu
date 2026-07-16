# GitHub Pages Deployment Guide

## 🚀 Automatic Deployment

This project includes GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the `main` branch.

### How It Works

1. **Push to `main` branch**: Triggers the deployment workflow
2. **Build**: Vite builds the project and creates `dist/` directory
3. **Upload**: Artifacts are uploaded to GitHub Pages
4. **Deploy**: GitHub Pages publishes the site

### Manual Deployment

If you need to deploy manually:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Preview the production build
npm run preview

# Deploy to GitHub Pages (if using gh-pages)
npm run deploy
```

## 📋 Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. In **Build and deployment**:
   - Branch: `main` / `/(root)`
   - Folder: `dist`
4. Click **Save**

### 2. Configure Repository Settings

Add these files to your repository:

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- Update `vite.config.ts` - Ensure `base: '/'` is set
- Commit all changes to `main` branch

### 3. Push to GitHub

```bash
cd /home/newstex/space-acccloned-games-typegpu
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### 4. Monitor Deployment

1. Go to **Actions** tab
2. Click on the workflow run
3. Monitor deployment progress

### 5. Access Your Site

Once deployment completes, visit:
```
https://YOUR_USERNAME.github.io/space-acccloned-games-typegpu/
```

## 🔧 Deployment Settings

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

**Features**:
- Automatic deployment on push to `main`
- Manual deployment via `workflow_dispatch`
- Uses GitHub Pages API for authentication
- Parallel build and deploy
- Prevents concurrent deployments

**Environment**:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Vite Configuration

**Base Path**: `/'` (GitHub Pages root)

```typescript
export default defineConfig({
  base: '/',  // GitHub Pages default
  // ...
})
```

## 📱 GitHub Pages URL Structure

```
https://YOUR_USERNAME.github.io/space-acccloned-games-typegpu/
```

**Example**:
```
https://sparky-moyers.github.io/space-acccloned-games-typegpu/
```

## 🎯 Deployment Checklist

- [ ] GitHub repository created
- [ ] `.github/workflows/deploy.yml` added
- [ ] `vite.config.ts` configured with `base: '/'`
- [ ] `main` branch pushed
- [ ] GitHub Pages enabled in Settings
- [ ] Deployment workflow configured
- [ ] Deployment tested

## 🚨 Troubleshooting

### Deployment Failed

**Check Actions tab**:
1. Click on failed workflow run
2. View logs for errors
3. Common issues:
   - Build errors → Check `npm run build`
   - Authentication errors → Verify GitHub Pages settings
   - Permission errors → Verify workflow permissions

### Site Not Loading

**Common causes**:
1. GitHub Pages still deploying → Wait for completion
2. Incorrect base path → Check `vite.config.ts`
3. Build artifacts missing → Ensure `dist/` directory exists
4. Browser cache → Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Build Errors

**Fix build issues**:
1. Check Node.js version (requires 18+)
2. Review `package.json` dependencies
3. Check TypeScript configuration
4. Ensure `src/` directory structure is correct

### Assets Not Loading

**Asset issues**:
1. Ensure `public/` directory exists
2. Check `assetsInclude` in `vite.config.ts`
3. Verify asset paths in React components
4. Clear browser cache

## 📊 Monitoring Deployment

### Check Deployment Status

1. Go to **Actions** tab
2. Select the deployment workflow
3. View detailed logs

### Access Deployment URL

Once deployed, your site will be available at:
```
https://YOUR_USERNAME.github.io/space-acccloned-games-typegpu/
```

### View Deployment History

1. Go to **Pages** section in Settings
2. Click **Change source** → **Deploy from a branch**
3. View deployment history and URLs

## 🔄 Continuous Deployment

The setup enables **continuous deployment**:

```bash
# Every push to main triggers deployment
git add .
git commit -m "Update game"
git push origin main

# Wait 1-2 minutes
# Visit: https://YOUR_USERNAME.github.io/space-acccloned-games-typegpu/
```

## 🎨 Custom Domain (Optional)

### Add Custom Domain

1. **GitHub Pages**:
   - Go to **Settings** → **Pages**
   - Add custom domain (e.g., `space-colony.yourdomain.com`)
   - Enable automatic HTTPS if available

2. **DNS Configuration**:
   ```dns
   # A record
   space-colony.yourdomain.com  →  185.199.108.153
   space-colony.yourdomain.com  →  185.199.109.153
   space-colony.yourdomain.com  →  185.199.110.153
   space-colony.yourdomain.com  →  185.199.111.153

   # CNAME record
   www.space-colony.yourdomain.com → yourdomain.github.io
   ```

### Force HTTPS

- GitHub Pages automatically provides HTTPS
- Verify SSL certificate in GitHub Pages settings

## 📈 Performance Optimization

### Build Optimizations

The GitHub Actions workflow includes:

```javascript
terserOptions: {
  compress: {
    drop_console: true,  // Remove console.log
    drop_debugger: true  // Remove debugger statements
  }
}
```

### Minification

- **Mode**: Terser (production)
- **Optimizations**: Tree shaking, dead code elimination

### Code Splitting

```javascript
manualChunks: {
  'three': ['three'],
  'typegpu': ['typegpu']
}
```

## 🔐 Security Best Practices

- ✅ **Read-only access**: Contents are only read
- ✅ **Write access**: Only Pages artifacts
- ✅ **Auth tokens**: GitHub Actions inject authentication
- ✅ **Secrets management**: No credentials required

## 📞 Support

If deployment fails:

1. Check GitHub Actions logs
2. Verify repository settings
3. Ensure Node.js version compatibility
4. Review build configuration

---

**Deployment Ready!** Your Space Acccloned game will automatically deploy to GitHub Pages on every push! 🚀