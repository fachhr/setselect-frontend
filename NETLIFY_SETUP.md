# Netlify Deployment Setup - Silvia's List Frontend

## Quick Setup Guide

### 1. Connect Repository to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select `silvias-list-frontend`
4. Netlify will auto-detect Next.js configuration

### 2. Configure Environment Variables

Go to: **Site Settings → Environment Variables**

Add the following variables (get actual values from SILVIAS_LIST_CREDENTIALS.txt):

**Public Variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  
NEXT_PUBLIC_RAILWAY_API_URL
```

**Private Variables (server-side only):**
```
SUPABASE_SERVICE_ROLE_KEY
PARSER_API_KEY
```

⚠️ **SECURITY:** Never commit actual values to git!

### 3. Deploy

Click "Deploy site" - Netlify will:
- Run `npm run build`
- Use `@netlify/plugin-nextjs` automatically
- Deploy to production

### 4. Verify

Test your production URL:
- Form submission works
- CV upload succeeds  
- Parser integration functional

---

For detailed credentials, see **SILVIAS_LIST_CREDENTIALS.txt** (local only, not in git).
