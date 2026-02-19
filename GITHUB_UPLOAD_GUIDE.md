# GitHub Upload Guide

## ✅ Project is Ready for Upload!

Your WLB Portal project has been committed and is ready to push to GitHub.

## Step-by-Step Instructions

### Option 1: Create New Repository on GitHub

1. **Go to GitHub**
   - Visit: https://github.com/new
   - Or click: Repositories → New repository

2. **Create Repository**
   - **Repository name:** `wlb-portal` (or your preferred name)
   - **Description:** "Secure whistleblower reporting platform with RBAC and encryption"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click **Create repository**

3. **Push to GitHub**
   
   Copy the commands from GitHub and run them in your terminal:
   
   ```bash
   cd /Users/mac158/Documents/wlb/wlb-portal
   
   # Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/wlb-portal.git
   
   # Push to GitHub
   git push -u origin main
   ```

### Option 2: Using GitHub CLI

If you have GitHub CLI installed:

```bash
cd /Users/mac158/Documents/wlb/wlb-portal

# Create and push in one command
gh repo create wlb-portal --public --source=. --remote=origin --push
```

### Option 3: Using SSH (Recommended for frequent pushes)

1. **Generate SSH key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add SSH key to GitHub**:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the contents of `~/.ssh/id_ed25519.pub`

3. **Push using SSH**:
   ```bash
   cd /Users/mac158/Documents/wlb/wlb-portal
   git remote add origin git@github.com:YOUR_USERNAME/wlb-portal.git
   git push -u origin main
   ```

## Verify Upload

After pushing, verify on GitHub:
1. Go to your repository: https://github.com/YOUR_USERNAME/wlb-portal
2. Check that all files are present
3. Verify README.md displays correctly

## Post-Upload Setup

### 1. Add Repository Topics

On GitHub, add these topics to your repository:
- `whistleblower`
- `nextjs`
- `typescript`
- `rbac`
- `encryption`
- `prisma`
- `react`
- `testing`

### 2. Enable GitHub Actions (Optional)

Create `.github/workflows/test.yml` for CI/CD:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

### 3. Protect Main Branch

On GitHub:
1. Go to Settings → Branches
2. Add branch protection rule for `main`
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Include administrators

### 4. Add Environment Secrets

On GitHub: Settings → Secrets and variables → Actions

Add these secrets:
- `DATABASE_URL` - Production database connection
- `JWT_SECRET` - Production JWT secret
- `AWS_ACCESS_KEY_ID` - (Optional) S3 access
- `AWS_SECRET_ACCESS_KEY` - (Optional) S3 secret

## Common Issues

### "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/wlb-portal.git
```

### "Permission denied (publickey)"

This means SSH key is not set up. Either:
1. Set up SSH keys (see Option 3 above)
2. Or use HTTPS instead:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/wlb-portal.git
   ```

### "Updates were rejected because the remote contains work that you do not have"

This happens if you initialized the repo on GitHub with README/.gitignore. Force push (be careful):

```bash
git push -f origin main
```

## Repository Stats

After pushing, your repository will show:
- **85 files** committed
- **~28,750 lines** of code added
- **Languages:** TypeScript, JavaScript, CSS
- **Last commit:** Initial commit with full feature set

## Next Steps

1. ✅ Push to GitHub using instructions above
2. ✅ Share repository link with team
3. ✅ Set up branch protection
4. ✅ Configure CI/CD (GitHub Actions)
5. ✅ Add production secrets
6. ✅ Deploy to hosting (Vercel, Railway, etc.)

## Need Help?

- GitHub Docs: https://docs.github.com/
- Git Push Guide: https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository
- SSH Setup: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

**Ready to push?** Run these commands:

```bash
cd /Users/mac158/Documents/wlb/wlb-portal
git remote add origin https://github.com/YOUR_USERNAME/wlb-portal.git
git push -u origin main
```

(Replace `YOUR_USERNAME` with your GitHub username)
