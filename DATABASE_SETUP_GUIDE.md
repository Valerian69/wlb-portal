# Database Setup Guide for Vercel

## Current Status

⚠️ **Your app is currently using MOCK DATA** - No real database is connected yet.

To enable full functionality (user accounts, reports, messages), you need to set up a PostgreSQL database.

---

## Option 1: Vercel Postgres (Recommended - Easiest)

### Pricing
- **Hobby:** FREE (5GB storage, limited queries/month)
- **Pro:** $20/month (more resources)

### Setup Steps

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Select Your Project**
   - Click on `wlb-portal`

3. **Add Storage**
   - Go to **Storage** tab
   - Click **Add Database**
   - Select **Vercel Postgres**

4. **Create Database**
   - Database name: `wlb-portal-db`
   - Region: Choose closest to your users
   - Click **Create**

5. **Connect to Project**
   - Vercel will automatically add `POSTGRES_URL` to environment variables

6. **Update Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:
   
   ```env
   DATABASE_URL="postgres://user:password@host.vercel-pg.com:5432/dbname"
   ```

7. **Run Migrations**
   
   Open Vercel **Deployments** → Click latest deployment → **View Build Logs**
   
   Or run locally:
   ```bash
   npx prisma migrate deploy
   ```

---

## Option 2: Neon (Serverless Postgres - Free Tier)

### Pricing
- **Free:** 0.5GB storage, unlimited databases
- **Paid:** From $19/month

### Setup Steps

1. **Sign Up**
   ```
   https://neon.tech
   ```

2. **Create Project**
   - Project name: `wlb-portal`
   - Click **Create Project**

3. **Get Connection String**
   - Go to **Dashboard** → Your project
   - Click **Connect**
   - Copy the **Connection String**
   - Format: `postgres://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname`

4. **Add to Vercel**
   
   Vercel Dashboard → Settings → Environment Variables:
   
   ```env
   DATABASE_URL="your-neon-connection-string"
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "chore: Add Neon database connection"
   git push origin main
   ```

---

## Option 3: Supabase (Full Backend - Free Tier)

### Pricing
- **Free:** 500MB database, unlimited API requests
- **Pro:** $25/month

### Setup Steps

1. **Sign Up**
   ```
   https://supabase.com
   ```

2. **Create Project**
   - Organization: Your choice
   - Project name: `wlb-portal`
   - Database password: (save this!)
   - Region: Choose closest

3. **Get Connection String**
   - Go to **Settings** → **Database**
   - Click **Connection String**
   - Copy **URI** mode connection string

4. **Add to Vercel**
   
   ```env
   DATABASE_URL="postgres://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres"
   ```

---

## Option 4: Railway (Simple Postgres - Free Trial)

### Pricing
- **Trial:** $5 credit (free)
- **Standard:** $5/month

### Setup Steps

1. **Sign Up**
   ```
   https://railway.app
   ```

2. **Create PostgreSQL**
   - New → Database → PostgreSQL
   - Wait for provisioning

3. **Get Connection String**
   - Click on PostgreSQL service
   - Go to **Variables** tab
   - Copy `DATABASE_URL`

4. **Add to Vercel**
   - Same as above

---

## After Setting Up Database

### 1. Update Prisma Schema

Your schema is already configured. Just need to run migrations:

```bash
# Locally (for development)
npx prisma migrate dev

# Production (on Vercel)
npx prisma migrate deploy
```

### 2. Seed the Database (Optional)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/server/crypto/password';

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin
  const superAdminPassword = await hashPassword('demo123');
  await prisma.user.create({
    data: {
      email: 'super@admin.com',
      passwordHash: superAdminPassword,
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
    },
  });

  // Create Company Admin
  const companyAdminPassword = await hashPassword('demo123');
  const client = await prisma.client.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      primaryColor: '#3b82f6',
      isActive: true,
      encryptionKey: 'generated-key',
      encryptionIv: 'generated-iv',
    },
  });

  await prisma.user.create({
    data: {
      email: 'company@admin.com',
      passwordHash: companyAdminPassword,
      name: 'Company Administrator',
      role: 'COMPANY_ADMIN',
      clientId: client.id,
    },
  });

  console.log('✅ Database seeded!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

### 3. Check Database Connection

**Option A: Vercel CLI**
```bash
vercel env pull
npx prisma studio
```

**Option B: Online Database Viewer**

If using Neon/Supabase, they provide web-based database viewers.

**Option C: Local Prisma Studio**
```bash
npx prisma studio
# Opens at http://localhost:5555
```

---

## Verify Database is Working

### Test Queries

After setup, test with Prisma Client:

```typescript
// In a test API route or locally
import { prisma } from '@/lib/server/db';

// Check users
const users = await prisma.user.findMany();
console.log('Users:', users);

// Check clients
const clients = await prisma.client.findMany();
console.log('Clients:', clients);

// Check reports
const reports = await prisma.report.findMany();
console.log('Reports:', reports);
```

### Expected Output

If database is connected correctly:

```
Users: []  // Empty initially (unless seeded)
Clients: []  // Empty initially
Reports: []  // Empty initially
```

If using mock data (no database):

```
Users: [...]  // Mock data
Clients: [...]  // Mock data
Reports: [...]  // Mock data
```

---

## Troubleshooting

### Error: "Can't reach database server"

**Solution:**
1. Check `DATABASE_URL` in Vercel
2. Verify database is running
3. Check firewall/whitelist settings

### Error: "Prisma Client initialization failed"

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Redeploy
git add .
git commit -m "fix: Regenerate Prisma Client"
git push origin main
```

### Error: "Database does not exist"

**Solution:**
```bash
# Create database
npx prisma migrate deploy
```

---

## Recommended Setup

For **testing/development**: Use **Neon** (free, easy setup)

For **production**: Use **Vercel Postgres** or **Supabase** (better performance)

### Quick Start with Neon:

1. Go to https://neon.tech
2. Sign up with GitHub
3. Create project `wlb-portal`
4. Copy connection string
5. Add to Vercel: `DATABASE_URL=your-string`
6. Redeploy: `git push origin main`
7. Run migrations in Vercel deployment logs

---

## Database Schema Overview

Your app uses these tables:

| Table | Purpose |
|-------|---------|
| `User` | User accounts with roles |
| `Client` | Organizations/companies |
| `Report` | Whistleblower reports |
| `ChatRoom` | Isolated chat rooms |
| `Message` | Encrypted messages |
| `Attachment` | File uploads |
| `AuditLog` | Activity tracking |

---

## Need Help?

- **Prisma Docs:** https://www.prisma.io/docs
- **Vercel + Prisma:** https://vercel.com/guides/nextjs-prisma-postgres
- **Neon Docs:** https://neon.tech/docs
- **Supabase Docs:** https://supabase.com/docs

---

**Current Status:** ⚠️ Using mock data - Database setup required for production

**Next Step:** Choose a database provider and follow setup steps above
