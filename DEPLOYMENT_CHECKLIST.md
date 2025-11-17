# Deployment Checklist - Infrastructure Updates

## Overview
This checklist covers the infrastructure changes required after the recent code review and bug fixes.

## 1. Environment Variables (CRITICAL - Required for Parser Service)

### Action Required: Update Deployment Environment Variables

**In your deployment platform (Vercel/Railway/etc.):**

1. **REMOVE** this variable (security risk - exposes internal URLs to client):
   ```
   NEXT_PUBLIC_RAILWAY_API_URL
   ```

2. **ADD** this server-side only variable:
   ```
   RAILWAY_API_URL=https://your-parser-service.railway.app
   ```

3. **VERIFY** this variable exists (should already be set):
   ```
   PARSER_API_KEY=your-secret-api-key
   ```

**Why This Change?**
- `NEXT_PUBLIC_` prefix exposes variables to the client bundle
- This leaked internal API URLs in the browser
- Server-side only variables are secure and not exposed to clients

**After Updating:**
- Redeploy the frontend application
- Test CV upload to ensure parser service is triggered
- Check logs to verify parser API calls succeed

---

## 2. Database Migrations (Supabase)

### Migration 1: Auto-Increment Talent IDs

**File:** `supabase/migrations/001_talent_id_auto_increment.sql`

**What It Does:**
- Creates sequence for auto-incrementing talent IDs
- Adds `talent_id` column in format SVL-001, SVL-002, etc.
- Backfills existing records
- Adds unique constraint

**How to Run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `001_talent_id_auto_increment.sql`
4. Click "Run"
5. Verify success message

**Verification Query:**
```sql
SELECT talent_id, contact_first_name, created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;
```

---

### Migration 2: Performance Indexes

**File:** `supabase/migrations/002_performance_indexes.sql`

**What It Does:**
- Adds 6 strategic indexes for query optimization
- 10-100x faster queries with 100+ profiles
- GIN index for canton filtering
- Composite indexes for common patterns

**How to Run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `002_performance_indexes.sql`
4. Click "Run"
5. Wait for indexes to build (may take 30-60 seconds)

**Verification Query:**
```sql
EXPLAIN ANALYZE
SELECT id, talent_id, years_of_experience, salary_max
FROM user_profiles
WHERE years_of_experience IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;
```

**Expected Output:** Should see "Index Scan" (good), not "Seq Scan" (bad)

---

### Migration 3: Storage Security Policies

**File:** `supabase/migrations/003_storage_security_policies.sql`

**What It Does:**
- Secures CV storage bucket with RLS policies
- Service role can upload/read/delete
- Public access explicitly denied
- Creates bucket if not exists

**How to Run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `003_storage_security_policies.sql`
4. Click "Run"
5. Verify policies created

**Verification Steps:**

1. Check policies exist:
```sql
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%CVs%';
```

2. Check bucket configuration:
```sql
SELECT id, name, public
FROM storage.buckets
WHERE id = 'talent-pool-cvs';
```

**Expected:** `public` column should be `false`

3. Test upload (should succeed):
   - Submit a CV via the /join form
   - Check logs for successful upload

4. Test public access (should fail):
   - Try accessing CV URL without authentication
   - Should return 401/403 error

---

## 3. Testing Checklist

### After Environment Variable Update:

- [ ] Deploy frontend with new environment variables
- [ ] Submit test CV via /join form
- [ ] Check frontend logs for parser API call
- [ ] Check parser service logs for received request
- [ ] Verify profile appears in talent pool

### After Database Migrations:

- [ ] New profiles have talent_id (SVL-001, SVL-002, etc.)
- [ ] Seniority filter works correctly for 10+ years experience
- [ ] Canton filter performs quickly with 100+ profiles
- [ ] Salary range filter performs quickly
- [ ] CV storage bucket blocks public access
- [ ] Admin can still download CVs via service role

### Full End-to-End Test:

- [ ] Fill out /join form completely
- [ ] Upload CV (PDF or DOCX)
- [ ] Submit form successfully
- [ ] See success page with talent ID
- [ ] Profile appears in talent pool (home page)
- [ ] All filters work correctly
- [ ] Sorting works correctly
- [ ] Pagination works correctly

---

## 4. Rollback Plan (If Issues Occur)

### If Parser Service Stops Working:

1. Check environment variables are correctly set
2. Verify `RAILWAY_API_URL` doesn't have trailing slash
3. Check parser service is running on Railway
4. Review parser service logs for errors

### If Database Issues Occur:

**Rollback Migration 1 (Talent IDs):**
```sql
ALTER TABLE user_profiles DROP COLUMN IF EXISTS talent_id;
DROP SEQUENCE IF EXISTS talent_id_seq;
```

**Rollback Migration 2 (Indexes):**
```sql
DROP INDEX IF EXISTS idx_user_profiles_years_experience;
DROP INDEX IF EXISTS idx_user_profiles_created_at_desc;
DROP INDEX IF EXISTS idx_user_profiles_salary_range;
DROP INDEX IF EXISTS idx_user_profiles_desired_locations;
DROP INDEX IF EXISTS idx_user_profiles_filtering;
DROP INDEX IF EXISTS idx_user_profiles_parsing_status;
```

**Rollback Migration 3 (Storage Policies):**
```sql
DROP POLICY IF EXISTS "Service role can upload CVs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can read CVs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete CVs" ON storage.objects;
```

---

## 5. Monitoring After Deployment

### Metrics to Watch:

1. **CV Upload Success Rate**
   - Should remain at 95%+ success rate
   - Monitor for upload failures

2. **Parser Service Calls**
   - Check logs for parser API calls after each submission
   - Verify no 401/403/500 errors

3. **Query Performance**
   - Home page load time should be <500ms
   - Filter changes should be near-instant

4. **Storage Bucket Security**
   - No public access errors in logs
   - No unauthorized CV downloads

### Where to Check:

- **Frontend Logs:** Vercel/Railway dashboard → Logs
- **Supabase Logs:** Supabase Dashboard → Logs → API
- **Database Performance:** Supabase Dashboard → Database → Query Performance
- **Storage Logs:** Supabase Dashboard → Storage → Logs

---

## 6. Summary of Changes

### Code Changes (Already Deployed):
✅ Fixed seniority filter string comparison bug
✅ Fixed form state management (isSubmitting cleanup)
✅ Fixed environment variable security issue
✅ Fixed validation bypass vulnerability
✅ Fixed double-fetch race condition
✅ Fixed filename sanitization security issue
✅ Added AbortController for request cancellation
✅ Centralized constants to /lib/constants.ts
✅ Fixed Link components throughout app
✅ Fixed Next.js 15 Suspense boundary requirement (Netlify build fix)
✅ Removed misleading debug console.logs from supabase admin client

### Infrastructure Changes (Pending):
⏳ Update environment variables (RAILWAY_API_URL)
⏳ Run database migration 001 (talent_id)
⏳ Run database migration 002 (performance indexes)
⏳ Run database migration 003 (storage security)

### Parser Service Changes:
✅ No changes required - API contract unchanged

---

## 7. Priority Order

**Priority 1 (Critical):**
1. Update environment variables
2. Redeploy frontend
3. Test CV upload works

**Priority 2 (Important):**
4. Run migration 001 (talent_id)
5. Run migration 003 (storage security)
6. Test full submission flow

**Priority 3 (Performance):**
7. Run migration 002 (indexes)
8. Verify query performance improvements

---

## Need Help?

If you encounter any issues during deployment:

1. Check the migration file comments for troubleshooting
2. Review Supabase logs for specific error messages
3. Verify environment variables are set correctly
4. Test each component individually to isolate issues

All migrations are idempotent (safe to run multiple times) and include verification queries.
