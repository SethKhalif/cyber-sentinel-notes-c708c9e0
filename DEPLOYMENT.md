# Cyber Sentinel - Lovable Deployment Guide

## Overview

Cyber Sentinel is a modern full-stack TypeScript application with:
- **Frontend**: React + Vite + Tailwind CSS + TypeScript
- **Backend**: Node.js Express API
- **Database**: Supabase PostgreSQL
- **Hosting**: Lovable.dev

This guide provides step-by-step instructions for deploying your application to Lovable.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Lovable Deployment](#lovable-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Backend Deployment](#backend-deployment)
7. [Monitoring & Logs](#monitoring--logs)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to Lovable, ensure you have:

- **Git**: For version control
- **Node.js 18+**: Runtime environment
- **npm/bun**: Package manager
- **Gitpush account**: For Git-based deployments
- **Supabase account**: For database and authentication
- **Stripe account** (optional): For payment processing

### Lovable Requirements

1. **Lovable Account**: Sign up at [lovable.dev](https://lovable.dev)
2. **GitHub Repository**: Connected to your Lovable project
3. **API Keys**: Gathered and added to environment variables

---

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone your repository
git clone <your-repository-url>
cd cyber-sentinel-notes

# Install frontend dependencies
npm install

# Install backend dependencies
npm run server:install
```

### 2. Environment Configuration

Create `.env.local` in the root directory:

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your actual values
nano .env.local
```

**Frontend Variables** (.env.local):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_your_key_here
```

Create `server/.env`:

```bash
cp server/.env.example server/.env
nano server/.env
```

**Backend Variables** (server/.env):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_your_key_here
```

### 3. Run Development Servers

```bash
# Terminal 1: Start frontend (port 5173)
npm run dev

# Terminal 2: Start backend (port 3001)
npm run server:dev
```

Your application is now running at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## Lovable Deployment

### Step 1: Connect GitHub Repository

1. **Create a new project on Lovable**:
   - Go to [lovable.dev](https://lovable.dev)
   - Click "New Project"
   - Select "Connect GitHub Repository"

2. **Authorize Lovable with GitHub**:
   - Allow Lovable to access your repositories
   - Select your `cyber-sentinel-notes` repository

3. **Configure Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `.` (project root)
   - **Node Version**: 18+

### Step 2: Add Environment Variables

In Lovable Project Settings:

1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:

```
Frontend Variables:
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_API_URL=https://[your-api-domain].com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[your-key]
VITE_APP_URL=https://[your-app].lovable.app

Backend Variables (if using separate backend):
NODE_ENV=production
PORT=3001
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
FRONTEND_URL=https://[your-app].lovable.app
STRIPE_SECRET_KEY=sk_live_[your-key]
```

### Step 3: Configure Database

1. **Supabase Setup**:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your **Project URL** and **Anon Key**
   - Add to Lovable environment variables

2. **Run Database Migrations**:
   ```bash
   # From supabase/migrations directory
   psql -h [your-host] -U [your-user] -d [your-db] -f [migration-file].sql
   ```

   Or use Supabase Dashboard:
   - Go to **SQL Editor** → **New Query**
   - Run migration files from `supabase/migrations/`

### Step 4: Deploy to Lovable

1. **Automatic Deployment**:
   - Push to your main branch
   - Lovable automatically builds and deploys
   - Monitor deployment in Lovable Dashboard

2. **Manual Deployment** (if needed):
   - In Lovable Dashboard, select your project
   - Click **Deploy** button
   - Select branch and confirm

---

## Backend Deployment Options

### Option 1: Deploy Backend to Vercel (Recommended)

1. **Create Vercel Account**: [vercel.com](https://vercel.com)

2. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

3. **Deploy Backend**:
   ```bash
   cd server
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel**:
   - Project Settings → Environment Variables
   - Add all backend variables from earlier

5. **Update Frontend API URL**:
   - In `.env.local`: `VITE_API_URL=https://[your-vercel-url].vercel.app`

### Option 2: Deploy Backend to Railway.app

1. **Create Railway Account**: [railway.app](https://railway.app)

2. **Connect GitHub Repository**:
   - New Project → GitHub Repo
   - Select `cyber-sentinel-notes` repository

3. **Configure Build Settings**:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
   - **Build Command**: `npm run build`

4. **Add Environment Variables**:
   - Project Settings → Variables
   - Add all backend variables

5. **Deploy**:
   - Click **Deploy** and Railway will build automatically

### Option 3: Deploy Backend to Fly.io

1. **Install Fly CLI**: Follow [fly.io docs](https://fly.io/docs/getting-started/installing-fly/)

2. **Deploy**:
   ```bash
   cd server
   fly launch
   ```

3. **Set Secrets**:
   ```bash
   fly secrets set VITE_SUPABASE_URL=[your-url]
   fly secrets set VITE_SUPABASE_ANON_KEY=[your-key]
   ```

---

## Frontend + Backend Integration

### Update API Calls

In your frontend code, ensure API calls use the environment variable:

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
```

### Update Hooks

```typescript
// src/hooks/useCveAnalysis.ts
import { apiCall } from '@/lib/api';

export function useCveAnalysis() {
  return useMutation({
    mutationFn: (cveId: string) => 
      apiCall('/analyze/cve', {
        method: 'POST',
        body: JSON.stringify({ cveId })
      })
  });
}
```

---

## Environment Configuration

### Frontend (.env.local)

```env
# Application
VITE_APP_NAME=Cyber Sentinel
VITE_NODE_ENV=development

# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_BASE_PATH=/api

# Supabase
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]

# Third-party Services
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_TELEMETRY=false

# URLs
VITE_APP_URL=http://localhost:5173
VITE_FORGOT_PASSWORD_URL=http://localhost:5173/reset-password
```

### Backend (server/.env)

```env
# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# Supabase
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]

# CORS
FRONTEND_URL=http://localhost:5173

# Database (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/cyber_sentinel

# Payment Processing
STRIPE_SECRET_KEY=sk_test_[your-key]

# Security
API_KEY_SECRET=your-secret-key
```

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Note your **Project URL** and **Anon Key**

### 2. Run Migrations

```bash
# Using psql (if installed)
psql -h db.[region].supabase.co -U postgres -d postgres -f supabase/migrations/*.sql

# Or use Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Click "New query"
# 3. Copy contents of migration files
# 4. Execute
```

### 3. Verify Schema

In Supabase Dashboard:
- Go to **Table Editor**
- Verify tables are created:
  - `profiles`
  - `notes`
  - `scans`
  - `teams`
  - `subscriptions`

---

## Monitoring & Logs

### Lovable Dashboard

- **Deployments**: View build logs and deployment history
- **Environment Variables**: Manage secrets and configuration
- **Domains**: Configure custom domain
- **Logs**: Real-time application logs

### Vercel/Railway/Fly Logs

**Vercel**:
```bash
vercel logs [deployment-id]
```

**Railway**:
- Dashboard → Logs tab

**Fly**:
```bash
fly logs
```

### Supabase Logs

- Dashboard → Logs
- Filter by function or table operations

---

## Custom Domain Setup

### 1. Configure Domain Provider

For your domain registrar (GoDaddy, Namecheap, etc.):

1. Point domain's **CNAME** to Lovable:
   ```
   your-domain.com → [project].lovable.app
   ```

2. Update DNS records

### 2. Configure in Lovable

1. **Project Settings** → **Domains**
2. **Add Custom Domain**
3. Enter your domain
4. Verify DNS propagation
5. Configure SSL certificate (automatic)

---

## Scaling & Performance

### Optimization Tips

1. **Image Optimization**:
   - Use Next.js Image component or similar
   - Compress assets in `/public`

2. **Code Splitting**:
   ```typescript
   const Workspace = lazy(() => import('./pages/Workspace'));
   ```

3. **Database Optimization**:
   - Add indexes to frequently queried columns
   - Use connection pooling (Supabase PgBouncer)

4. **Caching**:
   - Enable Lovable edge caching
   - Use React Query with proper stale time

### CDN Configuration

- Lovable uses Vercel Edge Network automatically
- Custom CDN can be configured in settings

---

## Troubleshooting

### Build Failures

```bash
# Clear build cache
rm -rf .next dist node_modules/.cache

# Rebuild
npm run build
```

**Common Issues**:
- Missing environment variables → Add to Lovable Settings
- TypeScript errors → Run `npm run build` locally first
- Module not found → Check import paths use `@/` alias

### API Connection Issues

```typescript
// Add logging to debug
const response = await fetch(`${API_URL}/api/health`);
console.log('API Response:', response.status);
```

**Checklist**:
- [ ] Backend environment variables set
- [ ] CORS enabled in Express: `cors({ origin: process.env.FRONTEND_URL })`
- [ ] API URL correct in `.env.local`
- [ ] Backend is running/deployed

### Authentication Issues

```typescript
// Verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**Checklist**:
- [ ] Supabase URL and key are correct
- [ ] User table exists in Supabase
- [ ] Row Security Policies configured
- [ ] Auth provider settings correct

### Database Connection

- Test in Supabase Dashboard → SQL Editor
- Check connection string in `.env`
- Verify IP whitelist if using direct connection

---

## Deployment Checklist

- [ ] All environment variables set in Lovable
- [ ] GitHub repository connected
- [ ] Build command configured: `npm run build`
- [ ] Output directory set: `dist`
- [ ] Database migrations applied
- [ ] Backend deployed to Vercel/Railway/Fly
- [ ] API URL updated in frontend
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring/logging enabled
- [ ] Backup strategy implemented
- [ ] Security headers configured

---

## Support & Resources

- **Lovable Docs**: [docs.lovable.dev](https://docs.lovable.dev)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Express Docs**: [expressjs.com](https://expressjs.com)
- **React Docs**: [react.dev](https://react.dev)
- **Tailwind Docs**: [tailwindcss.com](https://tailwindcss.com)

---

## Additional Notes

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git commit -am "Add feature"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request
# Lovable will show preview deployment

# Merge to main to deploy to production
git merge feature/your-feature
git push origin main
```

### Rollback Strategy

```bash
# View deployment history in Lovable Dashboard
# Click "Redeploy" on a previous deployment
# Or revert commit and push
git revert [commit-hash]
git push origin main
```

---

**Last Updated**: March 2026
**Version**: 1.0.0
