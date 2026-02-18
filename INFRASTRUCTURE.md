# Infrastructure & Data Flow

## Services & Regions

| Service            | Purpose                        | Region / Location        | Personal Data? |
| ------------------ | ------------------------------ | ------------------------ | -------------- |
| **Supabase**       | Database + file storage        | Zurich, Switzerland      | Yes (at rest)  |
| **Vercel**         | Hosting & serverless functions | Frankfurt, Germany (fra1)| Transit only   |
| **Railway**        | CV parser microservice         | Amsterdam, Netherlands   | Transit only   |
| **Resend**         | Transactional email            | US (global edge)         | Email address  |
| **OpenAI**           | Grammar/spelling correction  | US (API)                 | No PII         |
| **Google reCAPTCHA** | Bot protection (v3)          | Global                   | No PII stored  |

## Data Residency

- **At rest**: All personal data (profiles, CVs, contact details) is stored exclusively in **Supabase Zurich**.
- **In transit (Vercel)**: Serverless functions in Frankfurt receive requests and proxy to Supabase/Railway. No personal data is persisted on Vercel; it passes through during request handling.
- **In transit (Railway)**: The parser service in Amsterdam receives a CV storage path, reads the file from Supabase, extracts structured data, and writes results back to Supabase. No personal data is persisted on Railway.
- **OpenAI**: Receives only non-PII form text (highlight, desired roles, expertise, locations, languages) for grammar/spelling correction. Runs asynchronously after form submission via `after()`. If the API call fails, original text remains in DB unchanged.
- **Resend**: Receives only the requester's email address to send transactional notifications. Resend's processing may occur in the US.

## Swiss Regulatory Notes (nDSG / revFADP)

- **Supabase in Zurich**: Data at rest remains in Switzerland — no cross-border transfer for storage.
- **EU/EEA adequacy**: Germany and the Netherlands are EU member states. Switzerland recognises EU/EEA countries on its adequacy list, so transit processing in Frankfurt and Amsterdam is compliant without additional safeguards.
- **US services (Resend)**: Only the requester's email address is sent to Resend for delivery. If stricter controls are needed, consider an EU-based email provider or ensure Resend's DPA with Standard Contractual Clauses is in place.
- **Google reCAPTCHA**: Sends browser telemetry (IP, behaviour signals) to Google for scoring. No PII is stored by the application, but Google's own processing may involve US infrastructure. A cookie/privacy notice should disclose this.

## Two-Table Architecture (PII Separation)

The database uses two tables to separate PII from display data:

| Table | Purpose | Contains PII? | Queried by frontend? |
|-------|---------|---------------|----------------------|
| `user_profiles` | Complete candidate data (source of truth) | Yes (name, email, phone, LinkedIn, company names) | No (admin/internal only) |
| `talent_profiles` | Neutralised display data for the website | No | Yes (`/api/talent-pool/list`) |

**How it works:**
- When a candidate submits the join form, both `user_profiles` (full data) and `talent_profiles` (display fields only) are inserted.
- When the CV parser completes, a database trigger and application code write parsed fields to **both** tables. `talent_profiles` receives the same data but with `companyName` stripped from `professional_experience` entries.
- The `/api/talent-pool/list` endpoint queries **only** `talent_profiles`, so even with direct DB access the display table reveals nothing identifying.
- `talent_profiles.profile_id` is a FK to `user_profiles.id` with `ON DELETE CASCADE`.

## API Routes & External Services

| Route                              | Method | External Service(s)                     | Description                                                  |
| ---------------------------------- | ------ | --------------------------------------- | ------------------------------------------------------------ |
| `/api/talent-pool/upload-cv`       | POST   | Supabase Storage                        | Validates and uploads CV file to `talent-pool-cvs` bucket    |
| `/api/talent-pool/submit`          | POST   | Supabase DB, Google reCAPTCHA, Railway, OpenAI | Validates form, verifies reCAPTCHA, inserts profile, triggers parser, async grammar correction |
| `/api/talent-pool/list`            | GET    | Supabase DB                             | Queries and returns filtered/sorted candidate profiles       |
| `/api/access/log`                  | POST   | Supabase DB                             | Logs company access events (email + access type)             |
| `/api/email/request-access`        | POST   | Resend                                  | Sends access-request notification email via Resend           |

## Environment Variables

| Variable                          | Used By             | Side    |
| --------------------------------- | ------------------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase client     | Client  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase client     | Client  |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase admin      | Server  |
| `RAILWAY_API_URL`                 | Parser trigger      | Server  |
| `PARSER_API_KEY`                  | Parser auth         | Server  |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`  | reCAPTCHA widget    | Client  |
| `RECAPTCHA_SECRET_KEY`            | reCAPTCHA verify    | Server  |
| `OPENAI_API_KEY`                  | OpenAI grammar fix  | Server  |
| `RESEND_API_KEY`                  | Resend email        | Server  |

## Database Sync Trigger

The `sync_parsed_cv_data_to_profile()` trigger in Supabase automatically syncs parsed CV data from `cv_parsing_jobs` to both `user_profiles` and `talent_profiles` when a job's status transitions to `completed`.

- **Source file**: `setselect-parser/database/sync_trigger.sql`
- **Deployment**: Manual — copy into Supabase SQL Editor and run. NOT auto-deployed with Railway or Vercel.
- **Idempotent**: `CREATE OR REPLACE FUNCTION` + `DROP TRIGGER IF EXISTS` — safe to re-run at any time.
- **After any column type migration**: You MUST re-deploy the trigger. It is a compiled function — column type changes do not propagate to it.

### Column Type Reference

The trigger must match column types exactly. A mismatch in any `COALESCE` crashes the entire transaction silently (profiles appear never to have been parsed).

| Column | Type | Tables | Trigger Cast |
|--------|------|--------|-------------|
| `languages` | `JSONB` | both | `'[]'::jsonb` |
| `education_history` | `JSONB` | both | `::JSONB` |
| `professional_experience` | `JSONB` | both | `::JSONB` |
| `technical_skills` | `JSONB` | both | `::JSONB` |
| `soft_skills` | `JSONB` | both | `::JSONB` |
| `industry_specific_skills` | `JSONB` | both | `::JSONB` |
| `certifications` | `JSONB` | both | `::JSONB` |
| `professional_interests` | `JSONB` | both | `::JSONB` |
| `extracurricular_activities` | `JSONB` | both | `::JSONB` |
| `base_projects` | `JSONB` | both | `::JSONB` |
| `contact_address` | `JSONB` | `user_profiles` | `::JSONB` |
| `functional_expertise` | `TEXT[]` | both | `ARRAY(SELECT jsonb_array_elements_text(...))` |

### Runbook: Re-trigger Failed CV Parsing Jobs

When parsing jobs fail (profiles invisible on site, `parsing_completed_at` is NULL), follow these steps.

**1. Identify failed jobs**
```sql
SELECT cpj.id AS job_id, up.cv_storage_path, up.contact_first_name, cpj.status
FROM cv_parsing_jobs cpj
JOIN user_profiles up ON up.id = cpj.profile_id
WHERE cpj.status = 'failed'
ORDER BY cpj.created_at DESC;
```

**2. If the failure is a trigger bug, fix and re-deploy the trigger**
```sql
-- Check current trigger source for issues:
SELECT prosrc FROM pg_proc WHERE proname = 'sync_parsed_cv_data_to_profile';

-- After fixing sync_trigger.sql locally, copy full file into SQL Editor and run.
```

**3. Reset failed jobs**
```sql
UPDATE cv_parsing_jobs
SET status = 'pending', error_message = NULL, completed_at = NULL, extracted_data = NULL
WHERE status = 'failed';
```

**4. Re-trigger each job via parser API**

Credentials are in `setselect-frontend/.env.local` (`RAILWAY_API_URL`, `PARSER_API_KEY`).

```bash
curl -X POST {RAILWAY_API_URL}/api/v1/parse \
  -H "Content-Type: application/json" \
  -H "x-internal-api-key: {PARSER_API_KEY}" \
  -d '{"jobId": "<job_id>", "storagePath": "<cv_storage_path>"}'
```

The parser has NO auto-retry — each job must be triggered individually.

**5. Verify**
```sql
SELECT tp.talent_id, up.contact_first_name, cpj.status, tp.parsing_completed_at
FROM cv_parsing_jobs cpj
JOIN user_profiles up ON up.id = cpj.profile_id
JOIN talent_profiles tp ON tp.profile_id = cpj.profile_id
WHERE cpj.status = 'completed'
ORDER BY cpj.completed_at DESC LIMIT 10;
```

All re-triggered profiles should show `status = 'completed'` and `parsing_completed_at` set. They will be immediately visible on setselect.io.

## Backups

### Database Backups (Automated)

The Supabase Free plan includes **no built-in backups**. Automated daily backups run via GitHub Actions to compensate.

- **Schedule**: Every 12 hours (midnight and noon UTC)
- **Workflow**: `.github/workflows/backup-database.yml` in `setselect-frontend`
- **Destination**: Private repo [`fachhr/setselect-backups`](https://github.com/fachhr/setselect-backups)
- **RPO**: 12 hours
- **Cost**: $0

**What's backed up:**

| File / Directory | Contents |
|------------------|----------|
| `schema.sql` | All tables, indexes, RLS policies, triggers (including `sync_parsed_cv_data_to_profile()`) |
| `data.sql` | Full data dump of all tables (`user_profiles`, `talent_profiles`, `cv_parsing_jobs`, `company_access_log`) |
| `cvs/` | All CV files from the `talent-pool-cvs` Supabase Storage bucket, organised by profile subfolder |

**Connection**: Uses the Supabase session-mode pooler (`aws-1-eu-central-2.pooler.supabase.com:5432`) since the direct DB host is IPv6-only and GitHub Actions runners lack IPv6 support.

**Required GitHub Secrets** (on `setselect-frontend` repo):

| Secret | Description |
|--------|-------------|
| `SUPABASE_DB_PASSWORD` | Database password from Supabase Dashboard → Connect → Reveal password |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase Dashboard → Settings → API (used to download CVs from Storage) |
| `BACKUP_REPO_PAT` | Fine-grained PAT with `Contents: Read and write` scoped to `setselect-backups` only |

### Restoring from Backup

To restore to a new or existing Supabase project:

```bash
# 1. Restore schema
psql "$NEW_DB_URL" -f schema.sql

# 2. Restore data
psql "$NEW_DB_URL" -f data.sql
```

### What's NOT Backed Up

- **Profile pictures** — backed by S3 with 11-nines durability, low risk of loss
- Backup files are **not encrypted** — access is controlled by the private repo

## Recommendations

1. **Keep Supabase in Zurich** — this is the strongest data-residency guarantee and avoids any cross-border storage discussion.
2. **Keep Railway in an EU region** — Amsterdam is on Switzerland's adequacy list. Avoid moving it to a US region.
3. **Resend (US)**: Only email addresses are sent. If the product scales or stricter compliance is required, evaluate an EU-based transactional email provider or confirm Resend's DPA covers CH→US transfers via SCCs.
4. **Vercel region lock**: `vercel.json` pins serverless functions to `fra1` (Frankfurt). Do not remove this — it keeps request processing in the EU.
5. **reCAPTCHA disclosure**: Ensure the cookie/privacy banner discloses Google reCAPTCHA usage and its data processing.
