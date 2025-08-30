# Environment Variables Setup Guide

## Overview

You need separate environment variables for Production and Preview environments:

- **Production**: Main branch deployments
- **Preview**: Develop, staging, design branch deployments

## Current Setup

### Production Environment Variables (Already Set)
```bash
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Setting Up Preview Environment Variables

### Step 1: Create Staging Supabase Project (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project: "TIN CONNECT - Staging"
3. Copy the project URL and keys

### Step 2: Add Preview Environment Variables to Vercel

Run these commands to add preview environment variables:

```bash
# Supabase Preview Variables
npx vercel env add SUPABASE_URL_PREVIEW preview
npx vercel env add SUPABASE_ANON_KEY_PREVIEW preview
npx vercel env add SUPABASE_SERVICE_ROLE_KEY_PREVIEW preview
npx vercel env add VITE_SUPABASE_URL_PREVIEW preview
npx vercel env add VITE_SUPABASE_ANON_KEY_PREVIEW preview

# AWS Preview Variables
npx vercel env add AWS_REGION_PREVIEW preview
npx vercel env add AWS_ACCESS_KEY_ID_PREVIEW preview
npx vercel env add AWS_SECRET_ACCESS_KEY_PREVIEW preview
```

### Step 3: Update Your Code to Use Environment Variables

Update your Supabase configuration to use the correct environment variables:

```typescript
// client/lib/supabase.ts
const supabaseUrl = process.env.NODE_ENV === 'production' 
  ? process.env.VITE_SUPABASE_URL 
  : process.env.VITE_SUPABASE_URL_PREVIEW;

const supabaseAnonKey = process.env.NODE_ENV === 'production'
  ? process.env.VITE_SUPABASE_ANON_KEY
  : process.env.VITE_SUPABASE_ANON_KEY_PREVIEW;
```

### Step 4: Update Server Configuration

```typescript
// server/lib/supabase.ts
const supabaseUrl = process.env.NODE_ENV === 'production'
  ? process.env.SUPABASE_URL
  : process.env.SUPABASE_URL_PREVIEW;

const supabaseServiceKey = process.env.NODE_ENV === 'production'
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_SERVICE_ROLE_KEY_PREVIEW;
```

## Environment Variable Values

### Production (Main Branch)
- Use your existing Supabase project
- Use your production AWS credentials

### Preview (Develop/Staging/Design Branches)
- Use staging Supabase project (create new one)
- Use staging AWS credentials (create separate AWS account or use different keys)

## Verification

After setting up:

1. **Check environment variables**:
   ```bash
   npx vercel env ls
   ```

2. **Test preview deployment**:
   - Push to develop branch
   - Check Vercel deployment logs
   - Verify environment variables are loaded correctly

## Security Notes

- Never commit environment variables to git
- Use different API keys for production and staging
- Regularly rotate your keys
- Use least privilege principle for AWS credentials
