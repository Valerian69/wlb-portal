# Vercel Deployment Testing Guide

## ✅ Deployment Status

**Repository:** https://github.com/Valerian69/wlb-portal  
**Vercel URL:** https://wlb-portaleja.vercel.app/

## Test Results

### ✅ Working Features

| Page | URL | Status | Notes |
|------|-----|--------|-------|
| **Landing Page** | `/` | ✅ Working | Loads correctly, all sections visible |
| **Reporter Portal** | `/portal/acme-corp` | ✅ Working | Multi-step form loads, all fields visible |
| **Privacy Policy** | `/privacy` | ✅ Working | Full content loads |
| **Terms of Service** | `/terms` | ✅ Working | Full content loads |
| **Support** | `/support` | ✅ Working | FAQ and contact form load |

### ⚠️ Issues Found & Fixed

| Issue | Status | Fix |
|-------|--------|-----|
| Admin pages stuck on "Loading..." | 🔧 **FIXED** | Added client-side localStorage check |
| AuthContext SSR hydration error | 🔧 **FIXED** | Added `typeof window === 'undefined'` check |

## How to Test After Deployment

### 1. Wait for Vercel Deployment
After pushing to GitHub, Vercel automatically deploys (~1-2 minutes).

Check deployment status: https://vercel.com/dashboard

### 2. Test Reporter Portal

```
https://wlb-portaleja.vercel.app/portal/acme-corp
```

**Test Steps:**
1. Select a report type (e.g., Harassment)
2. Click "Next"
3. Fill in title and description
4. Continue through all 4 steps
5. Submit the report
6. **Save the Ticket ID and PIN** shown in confirmation

### 3. Test Report Status Check

```
https://wlb-portaleja.vercel.app/portal/acme-corp
```

**Test Steps:**
1. Click "View Status" tab
2. Enter the Ticket ID from step 2
3. Enter the PIN
4. Click "Access Report"
5. Verify you can see the report status

### 4. Test Admin Login (After Fix Deploys)

```
https://wlb-portaleja.vercel.app/admin/login
```

**Test Credentials:**
```
Super Admin:
- Email: super@admin.com
- Password: demo123

Company Admin:
- Email: company@admin.com
- Password: demo123
- Organization: acme-corp

External Admin:
- Email: admin@external.com
- Password: demo123

Internal Admin:
- Email: admin@internal.com
- Password: demo123
- Organization: acme-corp
```

## Common Issues & Solutions

### Issue: Page shows "Loading..." forever

**Cause:** Authentication state not properly initialized

**Solution:**
1. Clear browser localStorage
2. Refresh the page
3. Wait for deployment to complete

```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

### Issue: 404 on admin pages

**Cause:** Route not yet deployed or middleware issue

**Solution:**
1. Check Vercel deployment logs
2. Verify all admin pages are in the build output
3. Wait for deployment to complete

### Issue: API endpoints return 500

**Cause:** Missing environment variables

**Solution:**
Add these in Vercel dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-min-32-chars
```

## Vercel Configuration

### Required Environment Variables

Add these in Vercel dashboard:

```bash
# Database (required for full functionality)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Authentication
JWT_SECRET="minimum-32-character-secret-key"

# Optional: File storage
S3_BUCKET="your-bucket"
AWS_ACCESS_KEY_ID="key"
AWS_SECRET_ACCESS_KEY="secret"
```

### Build Settings

Vercel auto-detects Next.js. No configuration needed.

**Framework Preset:** Next.js  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`

## Testing Checklist

After each deployment:

- [ ] Landing page loads (`/`)
- [ ] Reporter portal works (`/portal/acme-corp`)
- [ ] Report submission completes
- [ ] Ticket ID + PIN login works
- [ ] Admin login page loads (`/admin/login`)
- [ ] Admin authentication works
- [ ] Super Admin dashboard accessible
- [ ] No console errors (F12)
- [ ] No 404s in Network tab
- [ ] Styles load correctly

## Deployment Flow

```bash
# 1. Make changes
git add .
git commit -m "fix: description"

# 2. Push to GitHub
git push origin main

# 3. Vercel automatically deploys
# Watch at: https://vercel.com/dashboard

# 4. Test after deployment completes
# Visit: https://wlb-portaleja.vercel.app/
```

## Rollback

If deployment breaks:

1. Go to Vercel Dashboard
2. Select project
3. Go to "Deployments" tab
4. Click on previous successful deployment
5. Click "Promote to Production"

Or via git:

```bash
git revert HEAD
git push origin main
```

## Performance Monitoring

Check these metrics in Vercel dashboard:

- **Web Vitals:** LCP, FID, CLS
- **Build Time:** Should be < 2 minutes
- **Edge Function Latency:** Should be < 100ms
- **Error Rate:** Should be < 1%

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Vercel Analytics:** https://vercel.com/analytics

---

**Last Updated:** 2026-02-19  
**Deployment Status:** ✅ Fixed - AuthContext client-side check added
