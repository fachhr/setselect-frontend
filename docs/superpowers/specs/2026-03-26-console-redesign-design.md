# Console Redesign — Design Specification

## Context

The SetSelect recruiter console is a functional candidate management tool, but it's organized around **data tables** (Candidates, Companies) rather than around **recruiter workflows** (what needs attention, where's my pipeline, what's happening with submissions). The dashboard shows four static numbers and a recent candidates list — a report, not a command center. The candidate detail panel is form-heavy with submissions buried. The companies page only manages portal access, not client pipelines.

This redesign reimagines the console through the lens of a veteran executive search consultant (Korn Ferry archetype): someone managing 40+ candidates across multiple client companies, who needs to know in 10 seconds where to focus energy for maximum impact.

## Design Direction: Slate & Signal

**Visual identity**: Cool steel-grey foundation. Ruthlessly desaturated canvas — then vivid, isolated status colors that function as signals, not decoration. The aesthetic references Linear and Palantir: precision instrument, zero ornamentation, maximum data density.

### Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-root` | `#101114` | Page background |
| `--bg-surface-1` | `#14161b` | Cards, panels, pipeline stages |
| `--bg-surface-2` | `#12141a` | Nested panels, alerts |
| `--bg-surface-3` | `#1c1e24` | Hover states, active tabs |
| `--border-subtle` | `#1c1e24` | Default borders |
| `--border-hover` | `#2a2d36` | Hover borders |
| `--text-primary` | `#eef0f4` | Headings, candidate names, values |
| `--text-secondary` | `#9198ab` | Body text, descriptions |
| `--text-tertiary` | `#6b7084` | Labels, metadata, timestamps |
| `--text-muted` | `#4e5468` | Metric labels, disabled text |
| `--accent` | `#6366f1` | Primary accent (indigo) — interactive elements, "review" signals |
| `--status-new` | `#818cf8` | New stage |
| `--status-screening` | `#a78bfa` | Screening stage |
| `--status-interviewing` | `#f59e0b` | Interviewing stage |
| `--status-offer` | `#fb923c` | Offer stage |
| `--status-placed` | `#22c55e` | Placed / success |
| `--status-rejected` | `#ef4444` | Rejected / stale / urgent |
| `--status-warning` | `#f59e0b` | Follow-up needed |

### Typography

- **Primary font**: Inter (unchanged)
- **Title font**: Behind The Nineties (keep for logo only — remove from UI text)
- **Heading weights**: 700–800 for numbers/counts, 600 for section titles, 500 for labels
- **Body weight**: 400
- **Monospace**: System monospace for REF IDs, timestamps, metrics

### Full Token Migration

Every current token mapped to its new value. No token left unmapped.

| Current Token | New Value | Notes |
|---------------|-----------|-------|
| `--bg-root: #010225` | `#101114` | Steel dark |
| `--bg-surface-1: #051650` | `#14161b` | Cards, panels |
| `--bg-surface-2: #0A2463` | `#12141a` | Nested panels |
| `--bg-surface-3: #0E3375` | `#1c1e24` | Hover, active |
| `--primary: #0077B6` | `#6366f1` | Indigo accent |
| `--primary-hover: #00B4D8` | `#818cf8` | Lighter indigo |
| `--primary-dim: rgba(0,119,182,0.15)` | `rgba(99,102,241,0.15)` | Indigo dim |
| `--primary-glow: rgba(0,119,182,0.25)` | `rgba(99,102,241,0.10)` | Subtle, reduced glow |
| `--secondary: #00B4D8` | `#6366f1` | Merge with primary (single accent) |
| `--secondary-dim: rgba(0,180,216,0.15)` | `rgba(99,102,241,0.10)` | Merge with primary-dim |
| `--highlight: #90E0EF` | `#818cf8` | Light indigo |
| `--highlight-dim: rgba(144,224,239,0.15)` | `rgba(129,140,248,0.10)` | |
| `--accent-light: #CAF0F8` | `#c7d2fe` | Indigo-100 |
| `--text-primary: #FFFFFF` | `#eef0f4` | Slightly warm white |
| `--text-secondary: #CAF0F8` | `#9198ab` | Steel secondary |
| `--text-tertiary: #90E0EF` | `#6b7084` | Steel tertiary |
| `--text-accent: #00B4D8` | `#818cf8` | Indigo text |
| `--text-muted: rgba(144,224,239,0.50)` | `#4e5468` | Solid muted |
| `--text-inverse: #010225` | `#101114` | Match bg-root |
| `--border-subtle: rgba(144,224,239,0.10)` | `#1c1e24` | Solid border |
| `--border-strong: rgba(144,224,239,0.20)` | `#2a2d36` | |
| `--border-hover: rgba(144,224,239,0.35)` | `#363940` | |
| `--border-focus: rgba(0,180,216,0.50)` | `rgba(99,102,241,0.50)` | Indigo focus ring |
| `--border-active: rgba(0,180,216,0.60)` | `rgba(99,102,241,0.60)` | |
| `--error: #FF6B6B` | `#ef4444` | Red-500 |
| `--error-dim: rgba(255,107,107,0.15)` | `rgba(239,68,68,0.12)` | |
| `--error-border: rgba(255,107,107,0.30)` | `rgba(239,68,68,0.25)` | |
| `--success: #2DD4BF` | `#22c55e` | Green-500 |
| `--success-dim: rgba(45,212,191,0.15)` | `rgba(34,197,94,0.12)` | |
| `--success-border: rgba(45,212,191,0.30)` | `rgba(34,197,94,0.25)` | |
| `--warning: #FBBF24` | `#f97316` | **Orange-500** (distinct from interviewing amber) |
| `--warning-dim: rgba(251,191,36,0.15)` | `rgba(249,115,22,0.12)` | |
| `--warning-border: rgba(251,191,36,0.30)` | `rgba(249,115,22,0.25)` | |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Simplified, no glow |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.3)` | Simplified |
| `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.4)` | Simplified |
| `--shadow-glow` | **Remove** — replace usages with `--shadow-sm` | No glow in Slate & Signal |
| `--shadow-inset` | `inset 0 1px 2px rgba(0,0,0,0.3)` | Simplified |

**Status-specific tokens** (new, additive):

| Token | Value | Usage |
|-------|-------|-------|
| `--status-new` | `#818cf8` | New stage — indigo |
| `--status-screening` | `#a78bfa` | Screening — violet |
| `--status-interviewing` | `#f59e0b` | Interviewing — amber |
| `--status-offer` | `#fb923c` | Offer — orange |
| `--status-placed` | `#22c55e` | Placed — green |
| `--status-rejected` | `#ef4444` | Rejected — red |
| `--status-follow-up` | `#f97316` | Follow-up needed — **orange** (distinct from interviewing amber) |

Note: `--warning` is now `#f97316` (orange) and `--status-interviewing` remains `#f59e0b` (amber). These are visually distinct.

### Surface Treatment

- No glassmorphism, no gradient backgrounds, no glow/blur effects
- Borders create structure (1px solid, subtle opacity)
- Shadows are minimal or absent — depth comes from background color layering
- Animations: fast and functional (150ms transitions), no decorative entrance animations
- Border radius: 6–8px for cards/panels, 4px for inline elements, 10px for pills/badges

---

## Screen 1: Command Center (replaces Dashboard)

**Route**: `/` (same)
**Purpose**: Answer "where should I spend my first hour?" in under 10 seconds.

### Pipeline Strip

Horizontal bar spanning full width. Five connected segments (New → Screening → Interviewing → Offer → Placed), each showing:
- Stage label (colored by status)
- Count (large, bold)
- Contextual meta line: "3 unreviewed", "2 stale (5d+)", "all active", "1 closing this week", "3 this month"
- 3px colored bar at bottom

Each segment is clickable — navigates to Talent Pool filtered to that stage.

### Two-Column Layout

**Left: Needs Attention panel**
- Header with "Needs Attention" title + red badge count
- Prioritized alert items, each with:
  - Left border colored by severity (red = stale/critical, amber = follow-up, indigo = review)
  - Candidate name (and company for submissions)
  - Detail line explaining why it needs attention
  - Tag (STALE, FOLLOW UP, REVIEW)
- Alert types:
  - **Stale candidates**: In a stage for 5+ days with no activity. Threshold: 5 days = amber, 7+ days = red.
  - **Submissions awaiting response**: Submission with status "submitted" and no change for 5+ days.
  - **Unreviewed new candidates**: Status "new" with no notes, no status change, and 2+ days old.
- Clicking an alert navigates to the candidate's dossier.
- Sorted by severity (red first), then by days stale descending.

**Right: Activity Feed panel**
- Header with "Activity Feed" title + "Last 48h" label
- Timeline with colored dots on a vertical line
- Each entry: timestamp, description line, optional sub-line with context
- Activity types shown:
  - Status changes (dot color = target status color)
  - New candidates (indigo dot)
  - Submission created/updated (relevant status color)
  - Notes added (purple dot)
- Source: derived from `recruiter_candidates.notes` (ActivityEntry JSONB array) and recent record changes

### Velocity Metrics Strip

Four metric cards at the bottom:
- **Avg Days in Stage**: Average time candidates spend in non-terminal stages. Compare to last 30 days.
- **Submit → Interview %**: Ratio of submissions that reached "interviewing" vs total submitted. Compare to last 30 days.
- **Placements MTD**: Count of candidates moved to "placed" this calendar month. Show target if set.
- **Active Submissions**: Count of submissions with status "submitted" or "interviewing". Show company count.

Each metric: label, large number, context line. **MVP: no trend comparison arrows.** Trend deltas require historical data the current schema doesn't store (see below). Show current-snapshot values only. Trend comparison is a post-MVP enhancement that requires a `status_history` table.

### Data Requirements

**Schema change (prerequisite):** Add `last_activity_at` TIMESTAMPTZ column to `recruiter_candidates`. Default to `created_at`. Update on every note addition, status change, or submission event. Add index: `CREATE INDEX idx_rc_last_activity ON recruiter_candidates(last_activity_at)`. This makes stale queries fast and indexable instead of requiring JSONB array scans.

- **New API endpoint**: `GET /api/dashboard` returning:
  - `pipeline_counts`: count per status (including rejected)
  - `stale_candidates`: candidates in non-terminal stage where `last_activity_at` is 5+ days old
  - `pending_submissions`: submissions with status "submitted" and `updated_at` 5+ days old
  - `unreviewed_new`: candidates with status "new", empty notes array, `created_at` 2+ days old
  - `recent_activity`: last 48h of ActivityEntry items across all candidates (scan JSONB notes arrays, filter by `created_at` field within each entry)
  - `metrics`:
    - `avg_days_in_stage`: average of `now() - status_changed_at` for candidates in non-terminal stages (snapshot, no trend)
    - `submission_interview_rate`: count of submissions with status "interviewing" or "placed" divided by total submissions (snapshot)
    - `placements_mtd`: count of submissions with status "placed" and `updated_at` in current calendar month
    - `active_submissions_count`: count of submissions with status "submitted" or "interviewing", plus distinct company count

---

## Screen 2: Talent Pool (replaces Candidates)

**Route**: `/candidates` (rename display to "Talent Pool" in nav)
**Purpose**: The workhorse. Two views togglable with a view switcher.

### View Toggle

Pill-style toggle in top-left: `⊞ Board` | `☰ Table`. Persists choice in localStorage.

### Search & Filters Bar

- Search input (existing debounced search)
- "★ Shortlisted" toggle (existing favorites filter)
- **New**: "⚠ Stale Only" filter button — shows only candidates with staleness alerts
- Existing status filter dropdown

### Board View (New)

Five main columns matching active pipeline stages (New, Screening, Interviewing, Offer, Placed). A sixth **collapsed "Rejected" column** appears at the far right — shows only the count and expands on click. Rejected candidates are not part of the active pipeline but must be findable. The table view with status filter is the primary way to browse rejected candidates.

**Column header**: Stage label (colored), count badge.

**Candidate cards** within each column:
- Candidate name (bold, with red stale dot if applicable)
- Role/title
- Meta: location + years of experience
- Days in stage line (red text if stale, with warning icon)
- Submission dots: small colored circles showing submission statuses (blue = submitted, amber = interviewing, green = placed, grey = rejected)
- Click card → opens dossier

**Stale highlighting**: Cards with 5+ days in stage get a left red border. 7+ days also get red text on the days line.

**Collapsed overflow**: If a column has more than 4 cards, show first 3–4 and a "+N more" link that expands the column.

**No drag-and-drop for MVP** — status changes happen via the dossier or inline dropdown. Drag-and-drop is a future enhancement.

**Board column sort order**: Cards within each column are sorted by staleness descending (most stale first), then by `status_changed_at` ascending (longest in stage first). This ensures the most urgent candidates are always at the top.

### Table View (Enhanced)

Keep the existing table structure but with these changes:

| Column | Change |
|--------|--------|
| Ref ID | Keep, monospace font |
| Name & Role | Keep, add stale dot indicator (red/amber) for at-risk candidates |
| Contact | Keep (email + phone with copy) |
| **Status** | **Change to inline dropdown pill** — click to change status without opening panel |
| **Submissions** | **New column** — colored dots summarizing submission statuses per candidate + count |
| Location | Keep |
| Experience | Keep |
| **Last Activity** | **Replaces "Added" column** — shows time since last ActivityEntry. Color-coded: green (<2d), grey (2-5d), red (>5d) |
| Owner | Keep |
| **Actions** | **Add "Submit" quick action** alongside existing favorite/CV/edit actions. Hover-reveal. "Submit" opens the dossier directly to the Submissions tab — no inline popover. |

**Row staleness**: Rows for stale candidates get a subtle red-tinted background (`rgba(239, 68, 68, 0.04)`).

**Inline status dropdown click handling**: The status pill `<select>` must call `e.stopPropagation()` to prevent triggering the row's `onClick` (which opens the dossier). Same pattern already used by copy buttons in the existing table.

### Data Requirements

- Modify `GET /api/candidates` to include:
  - `last_activity_at`: timestamp of most recent ActivityEntry
  - `submission_summary`: array of `{ status: SubmissionStatus, count: number }` per candidate
  - `days_in_stage`: calculated from `status_changed_at`

---

## Screen 3: Candidate Dossier (replaces Detail Panel)

**Component**: Still a slide-in panel from the right, but wider (max-w-2xl) and restructured.

### Header

- Candidate name (large, bold)
- REF ID + added date (monospace, tertiary text)
- Tagline: auto-generated summary — "{Role} — {active submission statuses}" (e.g., "Senior Analyst — Roland Berger interviewing, Bain submitted")
- Action buttons (right-aligned): "Download CV", "Add Note", "Submit to Company" (primary/accent)

### Two-Column Body

**Left sidebar** (280px): Key facts in a scannable format
- Status (clickable pill dropdown)
- Owner
- Contact (email, phone — clickable)
- Location
- Experience
- Target salary
- Desired roles (tags)
- Languages (tags with proficiency)
- Notice period
- Work eligibility

**Right main area**: Tabbed content

**Tab 1: Submissions & Pipeline** (default)
- Executive Summary box at top: auto-generated from profile data + submission history. 2-3 sentences summarizing where the candidate is, what's active, and any notable context from recent notes.
- Active Submissions: card per company showing company name, submission date, status badge, days since last update
- Past Submissions: same format but faded, sorted by recency

**Tab 2: Activity**
- Full activity timeline (existing CandidatePipeline component, restyled)
- Add note input at top
- Timeline entries: notes, status changes, submission events

**Tab 3: Profile Details**
- The existing editable form (CandidateProfileDetails functionality)
- Bio, education, experience, skills, functional expertise
- This is the "rarely needed" tab — available but not the default view

### Data Requirements

- Executive summary: generated client-side from existing data. Template-based, no AI:
  - Line 1: "{{first_name}} {{last_name}} is a {{years_of_experience}}-year {{desired_roles}} professional based in {{desired_locations[0]}}."
  - Line 2: "Currently {{active_submission_summary}}." (e.g., "interviewing at Roland Berger, submitted to Bain"). If no active submissions: "No active submissions."
  - Line 3 (conditional): Show the `text` field of the most recent `NoteEntry` (type === 'note') if created within the last 14 days. Truncate to 120 characters. Omit entirely if no recent notes.
- No new API endpoints needed — existing candidate + submissions endpoints provide all data.

---

## Screen 4: Companies — Pipeline View (New)

**Route**: `/companies` (same)
**Purpose**: Answer "what's my pipeline at each client?" instantly.

### View Toggle

Pill-style toggle: `Submissions Pipeline` (default) | `Portal Access` (existing portal management view). Labels are explicit because these tabs show different database entities: `submission_companies` + `candidate_submissions` vs `company_accounts`.

### Pipeline View (New, Default)

List of company cards, each showing:

**Company card**:
- Company name (heading)
- Stats line: "N submitted, N interviewing, N placed" (colored text for interviewing and placed)
- Mini pipeline bar: horizontal stacked bar showing proportion of submitted/interviewing/placed/rejected
- Candidate chips: each submitted candidate as a small chip with status dot + name + status label
- Chips with stale submissions (no response 5+ days) get highlighted border

**Sorting**: Companies sorted by total active submissions descending, then alphabetically.

**"+ Add Company" button**: Creates a new submission company (existing functionality from submission-companies endpoint).

### Access View (Existing)

The current companies table (company accounts with magic links, status, invite management). No changes needed — just moved to a tab.

### Data Requirements

- **New API endpoint**: `GET /api/companies/pipeline` returning:
  - Per submission company: company name, company_id, submissions grouped by status, per-submission: candidate name, profile_id, status, submitted_at, updated_at
  - Derived from joining `submission_companies` + `candidate_submissions` + `user_profiles`

---

## Navigation Changes

### Sidebar

Keep the existing collapsible sidebar structure. Change labels:
- "Dashboard" → "Command Center" (icon: unchanged LayoutDashboard)
- "Candidates" → "Talent Pool" (icon: unchanged Users)
- "Companies" → stays "Companies" (icon: unchanged Building2)
- "Settings" → stays "Settings" (icon: unchanged)

### TopBar

Keep existing structure. Remove the hidden notification bell and avatar (they're not functional). The page title updates dynamically.

Also update `app/(console)/layout.tsx` `pageTitles` object to match new labels.

### Login Page

The login page (`app/login/page.tsx`) uses the same CSS variables and will auto-inherit the Slate & Signal palette. However, it currently has decorative gradient glow effects using `--secondary` and `--primary` opacity blurs. These must be removed or simplified during Phase 1 token migration to match the "no glassmorphism, no glow" principle. The `.btn-gold` class on the login button will also be restyled when the global class is updated.

### New UI Components Required

- **Tabs component**: The dossier requires a simple tab component (Submissions & Pipeline | Activity | Profile Details). Build as `components/ui/Tabs.tsx` — a thin wrapper: `TabList` renders buttons with active border, `TabPanel` shows/hides content. No external library needed.

---

## Design System Migration

### What Changes

| Current | New |
|---------|-----|
| Ocean gradient color palette (blue/cyan) | Slate & Signal palette (steel grey, indigo accent) |
| CSS variable names (keep, but change values) | Same variable structure, new values |
| Glassmorphism `.glass-panel` | Flat surface with subtle border |
| `.btn-gold` primary button | Indigo primary button |
| Glow shadows, blur effects | Minimal shadows, border-only depth |
| Entrance animations (fade-in, slide-in, zoom-in) | Faster, functional transitions (150ms) |
| `--highlight`, `--accent-light`, `--secondary` (cyan) | Replace with single `--accent` (indigo) |
| Status colors (6 custom CSS vars) | Standardized status token set |

### What Stays

- Inter as primary font
- Behind The Nineties for logo only
- Responsive breakpoints (sm/md/lg)
- Mobile sidebar overlay pattern
- General layout structure (sidebar + topbar + main content)
- All existing API endpoints (additive changes only)
- Component file structure

---

## Empty States

| Screen | Empty State |
|--------|-------------|
| Command Center — Needs Attention | "All clear — no candidates need attention right now." (success state, show green check icon) |
| Command Center — Activity Feed | "No recent activity in the last 48 hours." |
| Board View — empty column | Column header still shows, body shows "No candidates" in muted text |
| Companies — Pipeline | "No submissions yet. Submit candidates from the Talent Pool." |
| Dossier — Submissions tab | "No submissions. Click 'Submit to Company' to get started." |
| Dossier — Activity tab | "No activity yet." |

## Accessibility

All color-coded signals must have a secondary non-color indicator:
- **Stale dots**: Red/amber dot + "⚠" icon prefix on the days-in-stage text
- **Severity borders** (Needs Attention alerts): Color border + text label (STALE, FOLLOW UP, REVIEW)
- **Status pills**: Always include text label, never color-only
- **Trend deltas** (post-MVP): Arrow character (↑/↓/→) + color
- **Submission dots** (board cards): Include `title` attribute with company name + status for hover/screen-reader

Keyboard navigation: all clickable elements (pipeline stages, alert items, board cards, table rows, dossier tabs) must be focusable and activatable with Enter/Space.

## Loading States

- Command Center: per-panel skeleton loading (pipeline strip skeleton, needs attention skeleton, activity skeleton, metrics skeleton). Use independent Suspense boundaries per section so fast-loading panels appear immediately.
- Board View: column headers render immediately, card skeletons within columns.
- Table: existing loading pattern (full-page spinner) is acceptable.
- Dossier: header renders immediately, tab content has its own loading state.

## File Renaming

Per the CODING_GUIDELINES.md "Ubiquitous Language" principle, rename components to match new domain terms:
- `CandidateDetailPanel.tsx` → `CandidateDossier.tsx`
- `CandidatePipeline.tsx` → `CandidateActivityTimeline.tsx`
- `StatsCards.tsx` → remove (replaced by Command Center)
- Keep `CandidateTable.tsx`, `CandidateKeyFacts.tsx`, `SubmissionSection.tsx` names (still accurate)

---

## Implementation Scope

### Phase 1: Design System + Command Center
1. Database migration: add `last_activity_at` column to `recruiter_candidates` with index, backfill from existing notes JSONB, add trigger/API logic to update on every note/status change
2. Migrate all color tokens in `globals.css` using the full token migration table
3. Remove glassmorphism (`.glass-panel`), glow effects (`--shadow-glow`), gradient backgrounds, blur effects
4. Update `.btn-gold` → indigo primary button, `.input-base` focus styles, `.filter-input` styling
5. Build Command Center dashboard (pipeline strip, needs attention, activity feed, metrics)
6. New `GET /api/dashboard` endpoint
7. Update sidebar labels (Dashboard → Command Center, Candidates → Talent Pool)

### Phase 2: Talent Pool — Board View + Table Enhancements
1. Build board view component with Kanban columns
2. Add view toggle (board/table) with localStorage persistence
3. Add staleness indicators to table rows
4. Add inline status dropdown in table
5. Add submissions summary column
6. Replace "Added" with "Last Activity" column
7. Add "Stale Only" filter
8. Modify `GET /api/candidates` to return computed fields

### Phase 3: Candidate Dossier
1. Restructure detail panel to dossier layout (sidebar + tabbed main)
2. Build executive summary template
3. Move submissions to primary tab
4. Restyle activity timeline
5. Move profile editing to third tab

### Phase 4: Companies Pipeline View
1. Build company pipeline cards
2. New `GET /api/companies/pipeline` endpoint
3. Add view toggle (Pipeline/Access)
4. Integrate staleness indicators for submissions

---

## Verification Plan

1. **Visual regression**: Open each screen (Command Center, Board, Table, Dossier, Companies) and verify the Slate & Signal palette is applied consistently — no remnants of ocean theme.
2. **Command Center data**: Create test candidates at various stages with varying staleness. Verify Needs Attention shows correct alerts sorted by severity. Verify Activity Feed pulls correct recent entries.
3. **Board View**: Verify candidates appear in correct columns. Verify stale candidates have red indicators. Verify submission dots match actual submission data.
4. **Table enhancements**: Verify inline status dropdown updates candidate status. Verify Last Activity column shows correct relative time. Verify staleness row highlighting.
5. **Dossier**: Open a candidate with multiple submissions. Verify executive summary is accurate. Verify submissions tab shows correct data. Verify all three tabs work.
6. **Companies pipeline**: Verify each company card shows correct submission counts and statuses. Verify stale submission highlighting.
7. **Responsive**: Test at mobile (375px), tablet (768px), and desktop (1280px) breakpoints.
8. **Existing functionality**: Verify all current CRUD operations still work — add/edit candidate, change status, add notes, create submissions, manage companies.
