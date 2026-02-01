# Infrastructure & Data Flow

## Services & Regions

| Service            | Purpose                        | Region / Location        | Personal Data? |
| ------------------ | ------------------------------ | ------------------------ | -------------- |
| **Supabase**       | Database + file storage        | Zurich, Switzerland      | Yes (at rest)  |
| **Vercel**         | Hosting & serverless functions | Frankfurt, Germany (fra1)| Transit only   |
| **Railway**        | CV parser microservice         | Amsterdam, Netherlands   | Transit only   |
| **Resend**         | Transactional email            | US (global edge)         | Email address  |
| **Google reCAPTCHA** | Bot protection (v3)          | Global                   | No PII stored  |

## Data Residency

- **At rest**: All personal data (profiles, CVs, contact details) is stored exclusively in **Supabase Zurich**.
- **In transit (Vercel)**: Serverless functions in Frankfurt receive requests and proxy to Supabase/Railway. No personal data is persisted on Vercel; it passes through during request handling.
- **In transit (Railway)**: The parser service in Amsterdam receives a CV storage path, reads the file from Supabase, extracts structured data, and writes results back to Supabase. No personal data is persisted on Railway.
- **Resend**: Receives only the requester's email address to send transactional notifications. Resend's processing may occur in the US.

## Swiss Regulatory Notes (nDSG / revFADP)

- **Supabase in Zurich**: Data at rest remains in Switzerland — no cross-border transfer for storage.
- **EU/EEA adequacy**: Germany and the Netherlands are EU member states. Switzerland recognises EU/EEA countries on its adequacy list, so transit processing in Frankfurt and Amsterdam is compliant without additional safeguards.
- **US services (Resend)**: Only the requester's email address is sent to Resend for delivery. If stricter controls are needed, consider an EU-based email provider or ensure Resend's DPA with Standard Contractual Clauses is in place.
- **Google reCAPTCHA**: Sends browser telemetry (IP, behaviour signals) to Google for scoring. No PII is stored by the application, but Google's own processing may involve US infrastructure. A cookie/privacy notice should disclose this.

## API Routes & External Services

| Route                              | Method | External Service(s)                     | Description                                                  |
| ---------------------------------- | ------ | --------------------------------------- | ------------------------------------------------------------ |
| `/api/talent-pool/upload-cv`       | POST   | Supabase Storage                        | Validates and uploads CV file to `talent-pool-cvs` bucket    |
| `/api/talent-pool/submit`          | POST   | Supabase DB, Google reCAPTCHA, Railway  | Validates form, verifies reCAPTCHA, inserts profile, triggers parser |
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
| `RESEND_API_KEY`                  | Resend email        | Server  |

## Recommendations

1. **Keep Supabase in Zurich** — this is the strongest data-residency guarantee and avoids any cross-border storage discussion.
2. **Keep Railway in an EU region** — Amsterdam is on Switzerland's adequacy list. Avoid moving it to a US region.
3. **Resend (US)**: Only email addresses are sent. If the product scales or stricter compliance is required, evaluate an EU-based transactional email provider or confirm Resend's DPA covers CH→US transfers via SCCs.
4. **Vercel region lock**: `vercel.json` pins serverless functions to `fra1` (Frankfurt). Do not remove this — it keeps request processing in the EU.
5. **reCAPTCHA disclosure**: Ensure the cookie/privacy banner discloses Google reCAPTCHA usage and its data processing.
