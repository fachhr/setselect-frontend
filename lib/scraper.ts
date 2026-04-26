import TurndownService from 'turndown';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from './supabase';
import type { JobSource, FetchMode, ScrapeResult, JobSeniority } from '@/types/recruiter';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExtractedJob {
  title: string;
  url: string;
  location: string | null;
  country: string | null;
  seniority: JobSeniority | null;
  date_posted: string | null;
}

function isValidDatePosted(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const parsed = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(parsed.getTime())) return null;
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  if (parsed > now || parsed < oneYearAgo) return null;
  return dateStr;
}

// ---------------------------------------------------------------------------
// ATS Platform Detection
// ---------------------------------------------------------------------------

interface ATSDetection {
  platform: 'workday' | 'greenhouse' | 'lever';
  host: string;
  company: string;
  site: string;
}

function detectPlatform(url: string): ATSDetection | null {
  try {
    const parsed = new URL(url);

    const workdayMatch = parsed.host.match(/^([^.]+)\.wd\d+\.myworkdayjobs\.com$/);
    if (workdayMatch) {
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const site = pathParts.filter((p) => !/^[a-z]{2}(-[A-Z]{2,3})?$/.test(p))[0];
      if (site) {
        return { platform: 'workday', host: parsed.host, company: workdayMatch[1], site };
      }
    }

    if (parsed.host === 'boards.greenhouse.io') {
      const board = parsed.pathname.split('/').filter(Boolean)[0];
      if (board) {
        return { platform: 'greenhouse', host: parsed.host, company: board, site: board };
      }
    }

    if (parsed.host === 'jobs.lever.co') {
      const company = parsed.pathname.split('/').filter(Boolean)[0];
      if (company) {
        return { platform: 'lever', host: parsed.host, company, site: company };
      }
    }
  } catch {}
  return null;
}

// ---------------------------------------------------------------------------
// Seniority Classification (deterministic)
// ---------------------------------------------------------------------------

function classifySeniority(title: string): JobSeniority {
  const lower = title.toLowerCase();
  if (/\b(ceo|cfo|cto|coo|cio|ciso|chief|president|partner|managing\s+director)\b/.test(lower)) return 'c-suite';
  if (/\b(vp|vice\s+president|director|head\s+of|svp|evp|general\s+manager)\b/.test(lower)) return 'executive';
  if (/\b(senior|sr\.?|lead|principal|staff|architect)\b/.test(lower)) return 'senior';
  if (/\b(junior|jr\.?|intern|trainee|entry[\s-]level|associate|graduate|apprentice)\b/.test(lower)) return 'junior';
  return 'mid';
}

// ---------------------------------------------------------------------------
// Date / Location Helpers
// ---------------------------------------------------------------------------

function parseRelativeDate(dateStr: string): string | null {
  if (!dateStr) return null;

  const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (isoMatch) return isValidDatePosted(dateStr);

  const now = new Date();
  const lower = dateStr.toLowerCase().trim();

  if (lower.includes('today')) {
    return isValidDatePosted(now.toISOString().split('T')[0]);
  }
  if (lower.includes('yesterday')) {
    now.setDate(now.getDate() - 1);
    return isValidDatePosted(now.toISOString().split('T')[0]);
  }

  const daysMatch = lower.match(/(\d+)\+?\s*days?\s*ago/);
  if (daysMatch) {
    now.setDate(now.getDate() - parseInt(daysMatch[1], 10));
    return isValidDatePosted(now.toISOString().split('T')[0]);
  }

  const fallback = new Date(dateStr);
  if (!isNaN(fallback.getTime())) {
    return isValidDatePosted(fallback.toISOString().split('T')[0]);
  }

  return null;
}

const COUNTRY_ALIASES: Record<string, string> = {
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'england': 'United Kingdom',
  'scotland': 'United Kingdom',
  'wales': 'United Kingdom',
  'us': 'United States',
  'usa': 'United States',
  'u.s.': 'United States',
  'u.s.a.': 'United States',
  'uae': 'United Arab Emirates',
  'ksa': 'Saudi Arabia',
};

function extractCountryFromLocation(location: string | null): string | null {
  if (!location) return null;
  const parts = location.split(',');
  const last = parts[parts.length - 1].trim();
  if (!last) return null;
  return COUNTRY_ALIASES[last.toLowerCase()] || last;
}

// ---------------------------------------------------------------------------
// Singleton clients
// ---------------------------------------------------------------------------

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});
turndown.remove(['script', 'style', 'nav', 'footer', 'iframe', 'noscript']);

function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('Missing ANTHROPIC_API_KEY');
  return new Anthropic({ apiKey: key });
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

const USER_AGENT = 'Mozilla/5.0 (compatible; SetSelect/1.0; career-page-monitor)';

async function fetchRawHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractJsonLdDatePosted(html: string): string | null {
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const date = findJobPostingDate(JSON.parse(match[1]));
      if (date) return date;
    } catch {
      continue;
    }
  }
  return null;
}

function findJobPostingDate(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findJobPostingDate(item);
      if (found) return found;
    }
    return null;
  }
  const obj = data as Record<string, unknown>;
  if (obj['@type'] === 'JobPosting' && typeof obj.datePosted === 'string') {
    return obj.datePosted.slice(0, 10);
  }
  if (Array.isArray(obj['@graph'])) {
    return findJobPostingDate(obj['@graph']);
  }
  return null;
}

export async function directFetch(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return turndown.turndown(html);
  } finally {
    clearTimeout(timeout);
  }
}

export async function jinaFetch(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      signal: controller.signal,
      headers: { 'Accept': 'text/markdown' },
    });
    if (!res.ok) throw new Error(`Jina HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// ATS Platform API Fetchers
// ---------------------------------------------------------------------------

const MAX_PLATFORM_JOBS = 500;

interface WorkdayPosting {
  title: string;
  externalPath: string;
  locationsText?: string;
  postedOn?: string;
  bulletFields?: string[];
}

async function fetchWorkdayJobs(detection: ATSDetection): Promise<ExtractedJob[]> {
  const apiBase = `https://${detection.host}/wday/cxs/${detection.company}/${detection.site}/jobs`;
  const allJobs: ExtractedJob[] = [];
  let offset = 0;
  const limit = 20;

  while (offset < MAX_PLATFORM_JOBS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
        body: JSON.stringify({ appliedFacets: {}, limit, offset, searchText: '' }),
      });
      if (!res.ok) throw new Error(`Workday API ${res.status}`);
      const data = await res.json() as { total: number; jobPostings: WorkdayPosting[] };

      for (const posting of data.jobPostings || []) {
        const jobUrl = `https://${detection.host}/en-US/${detection.site}${posting.externalPath}`;
        allJobs.push({
          title: posting.title,
          url: jobUrl,
          location: posting.locationsText || null,
          country: extractCountryFromLocation(posting.locationsText || null),
          seniority: classifySeniority(posting.title),
          date_posted: posting.postedOn ? parseRelativeDate(posting.postedOn) : null,
        });
      }

      offset += limit;
      if (offset >= data.total || (data.jobPostings || []).length === 0) break;
    } finally {
      clearTimeout(timeout);
    }
  }

  console.log(`[scrape] Workday API returned ${allJobs.length} jobs for ${detection.company}`);
  return allJobs;
}

interface GreenhouseJob {
  title: string;
  absolute_url: string;
  location: { name: string };
  updated_at: string;
}

async function fetchGreenhouseJobs(detection: ATSDetection): Promise<ExtractedJob[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${detection.company}/jobs`,
      { signal: controller.signal, headers: { 'User-Agent': USER_AGENT } },
    );
    if (!res.ok) throw new Error(`Greenhouse API ${res.status}`);
    const data = await res.json() as { jobs: GreenhouseJob[] };

    const jobs = (data.jobs || []).map((job): ExtractedJob => ({
      title: job.title,
      url: job.absolute_url,
      location: job.location?.name || null,
      country: extractCountryFromLocation(job.location?.name || null),
      seniority: classifySeniority(job.title),
      date_posted: job.updated_at ? isValidDatePosted(job.updated_at.split('T')[0]) : null,
    }));

    console.log(`[scrape] Greenhouse API returned ${jobs.length} jobs for ${detection.company}`);
    return jobs;
  } finally {
    clearTimeout(timeout);
  }
}

interface LeverPosting {
  text: string;
  hostedUrl: string;
  categories: { location?: string; team?: string };
  createdAt: number;
}

async function fetchLeverJobs(detection: ATSDetection): Promise<ExtractedJob[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(
      `https://api.lever.co/v0/postings/${detection.company}?mode=json`,
      { signal: controller.signal, headers: { 'User-Agent': USER_AGENT } },
    );
    if (!res.ok) throw new Error(`Lever API ${res.status}`);
    const data = await res.json() as LeverPosting[];

    const jobs = (data || []).map((posting): ExtractedJob => ({
      title: posting.text,
      url: posting.hostedUrl,
      location: posting.categories?.location || null,
      country: extractCountryFromLocation(posting.categories?.location || null),
      seniority: classifySeniority(posting.text),
      date_posted: posting.createdAt
        ? isValidDatePosted(new Date(posting.createdAt).toISOString().split('T')[0])
        : null,
    }));

    console.log(`[scrape] Lever API returned ${jobs.length} jobs for ${detection.company}`);
    return jobs;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// AI Extraction
// ---------------------------------------------------------------------------

const EXTRACTION_TOOL: Anthropic.Tool = {
  name: 'submit_jobs',
  description: 'Submit the extracted job listings from the career page.',
  input_schema: {
    type: 'object' as const,
    properties: {
      jobs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Job title exactly as shown' },
            url: { type: 'string', description: 'Full URL to the job posting. Resolve relative URLs against the career page base URL.' },
            location: { type: ['string', 'null'], description: 'Job location if mentioned (city, region, etc.)' },
            country: { type: ['string', 'null'], description: 'Country where the job is located. Use the full English country name (e.g. "Switzerland", "Germany"). For remote roles, use the country mentioned or null if unspecified.' },
            seniority: {
              type: ['string', 'null'],
              enum: ['junior', 'mid', 'senior', 'executive', 'c-suite', null],
              description: 'Classify seniority from title. junior=entry/intern/associate, mid=analyst/specialist, senior=senior/lead/principal, executive=VP/director/head, c-suite=C-level/president/partner',
            },
            date_posted: {
              type: ['string', 'null'],
              description: 'Original posting date in ISO format (YYYY-MM-DD). Convert relative dates like "Posted 3 days ago" or "30+ Days Ago" using today\'s date as reference. Return null if no posting date is visible.',
            },
          },
          required: ['title', 'url'],
        },
      },
      next_page_url: {
        type: ['string', 'null'],
        description: 'URL of the next page of job listings if pagination is visible (e.g. "Next", "Page 2", "Load More" link). Return null if this is the last page or no pagination exists.',
      },
    },
    required: ['jobs'],
  },
};

interface ExtractionResult {
  jobs: ExtractedJob[];
  nextPageUrl: string | null;
}

export async function extractJobListings(
  markdown: string,
  companyName: string,
  careerUrl: string,
  targetCountries?: string[],
): Promise<ExtractionResult> {
  const client = getAnthropicClient();

  const truncated = markdown.slice(0, 80_000);

  const countryHint = targetCountries && targetCountries.length > 0
    ? `\n- We are primarily interested in jobs in: ${targetCountries.join(', ')}. Extract all jobs you find but make sure to identify each job's country accurately — we filter by country in code.`
    : '';

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 16384,
    tools: [EXTRACTION_TOOL],
    tool_choice: { type: 'tool', name: 'submit_jobs' },
    messages: [
      {
        role: 'user',
        content: `Extract job listings from this ${companyName} career page (${careerUrl}).

Rules:
- For URLs: if relative, resolve against the base URL ${new URL(careerUrl).origin}
- For each job, identify the country from its location. Use the full English country name (e.g. "Switzerland", "Germany", "United States").
- Do NOT extract job descriptions — we fetch those separately from individual job pages
- For seniority: classify based on the job title
- Today's date is ${new Date().toISOString().split('T')[0]}. Extract any posting date shown for each job (e.g. "Posted 3 days ago", "Apr 15, 2026", "Today"). Convert to YYYY-MM-DD. For "30+ Days Ago", use 30 days before today. Return null if no date is visible.
- If no jobs are found, return an empty array
- Do NOT invent jobs — only extract what is actually on the page
- If you see pagination controls (e.g. "Next", "Page 2", numbered page links, "Load More"), return the URL of the next page in next_page_url. Resolve relative URLs against the base URL. Set to null if there is no next page or no pagination.${countryHint}

Page content:
${truncated}`,
      },
    ],
  });

  const toolBlock = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
  );
  if (!toolBlock) return { jobs: [], nextPageUrl: null };

  const input = toolBlock.input as { jobs: ExtractedJob[]; next_page_url?: string | null };
  const jobs = (input.jobs || []).filter((j) => j.title && j.url);
  const nextPageUrl = input.next_page_url || null;
  return { jobs, nextPageUrl };
}

// ---------------------------------------------------------------------------
// Country filtering (deterministic, post-extraction)
// ---------------------------------------------------------------------------

function filterByCountry(
  jobs: ExtractedJob[],
  targetCountries: string[],
): { matched: ExtractedJob[]; filtered: number } {
  if (targetCountries.length === 0) {
    return { matched: jobs, filtered: 0 };
  }

  const targets = new Set(targetCountries.map((c) => c.toLowerCase()));

  const matched = jobs.filter((job) => {
    if (!job.country) return true;
    const country = job.country.toLowerCase();
    if (targets.has(country)) return true;
    if (country === 'remote' || country.includes('remote')) return true;
    return false;
  });

  return { matched, filtered: jobs.length - matched.length };
}

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

export async function generateExternalId(url: string): Promise<string> {
  const data = new TextEncoder().encode(url.toLowerCase().trim());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------------------------------------------------------------------------
// Core scrape logic
// ---------------------------------------------------------------------------

const MAX_GENERIC_PAGES = 3;

export async function scrapeSource(source: JobSource): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    source_id: source.id,
    company_name: source.company_name,
    new_listings: 0,
    updated: 0,
    removed: 0,
    total_found: 0,
    country_filtered: 0,
    fetch_mode_used: source.fetch_mode === 'auto' ? 'direct' : source.fetch_mode,
    error: null,
  };

  let allExtracted: ExtractedJob[] = [];
  let modeUsed: FetchMode = 'direct';

  try {
    // Try ATS platform API first (returns all jobs, no AI needed)
    const atsDetection = detectPlatform(source.career_url);
    if (atsDetection) {
      try {
        switch (atsDetection.platform) {
          case 'workday':
            allExtracted = await fetchWorkdayJobs(atsDetection);
            break;
          case 'greenhouse':
            allExtracted = await fetchGreenhouseJobs(atsDetection);
            break;
          case 'lever':
            allExtracted = await fetchLeverJobs(atsDetection);
            break;
        }
        modeUsed = 'direct';
      } catch (platformErr) {
        console.log(`[scrape] ${atsDetection.platform} API failed for ${source.company_name}, falling back to HTML scrape: ${platformErr instanceof Error ? platformErr.message : platformErr}`);
      }
    }

    // Generic HTML scrape with pagination (fallback or non-ATS sites)
    if (allExtracted.length === 0) {
      let nextPageUrl: string | null = null;

      // Stage 1: try direct fetch (unless source is jina-only)
      if (source.fetch_mode !== 'jina') {
        try {
          const markdown = await directFetch(source.career_url);
          const extraction = await extractJobListings(markdown, source.company_name, source.career_url, source.target_countries);
          allExtracted = extraction.jobs;
          nextPageUrl = extraction.nextPageUrl;
          modeUsed = 'direct';
        } catch {
          if (source.fetch_mode === 'direct') throw new Error('Direct fetch failed');
        }
      }

      // Stage 2: Jina fallback
      if (allExtracted.length === 0 && source.fetch_mode !== 'direct') {
        const markdown = await jinaFetch(source.career_url);
        const extraction = await extractJobListings(markdown, source.company_name, source.career_url, source.target_countries);
        allExtracted = extraction.jobs;
        nextPageUrl = extraction.nextPageUrl;
        modeUsed = 'jina';
      }

      // Stage 3: Follow pagination
      let pageCount = 0;
      while (nextPageUrl && pageCount < MAX_GENERIC_PAGES) {
        try {
          console.log(`[scrape] following pagination page ${pageCount + 2} for ${source.company_name}: ${nextPageUrl}`);
          const markdown = modeUsed === 'jina'
            ? await jinaFetch(nextPageUrl)
            : await directFetch(nextPageUrl);
          const extraction = await extractJobListings(markdown, source.company_name, nextPageUrl, source.target_countries);
          allExtracted.push(...extraction.jobs);
          nextPageUrl = extraction.nextPageUrl;
          pageCount++;
        } catch {
          console.log(`[scrape] pagination fetch failed at page ${pageCount + 2} for ${source.company_name}`);
          break;
        }
      }
    }

    // Deduplicate by URL within this scrape
    const seenUrls = new Set<string>();
    allExtracted = allExtracted.filter((job) => {
      const normalized = job.url.toLowerCase().trim();
      if (seenUrls.has(normalized)) return false;
      seenUrls.add(normalized);
      return true;
    });

    result.total_found = allExtracted.length;

    // Country filter — deterministic code filter, not just prompt
    const { matched: jobs, filtered } = source.target_countries?.length
      ? filterByCountry(allExtracted, source.target_countries)
      : { matched: allExtracted, filtered: 0 };

    result.country_filtered = filtered;

    if (allExtracted.length === 0) {
      result.error = 'No jobs found on page — may have changed or require JS rendering';
      await updateSourceAfterScrape(source.id, result.error, modeUsed, source.fetch_mode);
      return result;
    }

    if (jobs.length === 0) {
      const countries = (source.target_countries || []).join(', ');
      result.error = `Found ${allExtracted.length} jobs, none in target countries (${countries})`;
      await updateSourceAfterScrape(source.id, null, modeUsed, source.fetch_mode);
      return result;
    }

    // Dedup and persist
    const currentExternalIds = new Set<string>();

    for (const job of jobs) {
      const externalId = await generateExternalId(job.url);
      currentExternalIds.add(externalId);

      const { data: existing } = await supabaseAdmin
        .from('job_listings')
        .select('id, removed_at, date_posted')
        .eq('source_id', source.id)
        .eq('external_id', externalId)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from('job_listings')
          .update({
            last_seen_at: new Date().toISOString(),
            removed_at: null,
            ...(job.seniority && { seniority: job.seniority }),
            ...(job.date_posted && !existing.date_posted && { date_posted: isValidDatePosted(job.date_posted) }),
          })
          .eq('id', existing.id);
        result.updated++;
      } else {
        await supabaseAdmin.from('job_listings').insert({
          source_id: source.id,
          external_id: externalId,
          title: job.title,
          url: job.url,
          location: job.location,
          description: null,
          seniority: job.seniority,
          date_posted: isValidDatePosted(job.date_posted),
          status: 'new',
        });
        result.new_listings++;
      }
    }

    // Mark removed listings (in DB but not in current scrape)
    const { data: dbListings } = await supabaseAdmin
      .from('job_listings')
      .select('id, external_id')
      .eq('source_id', source.id)
      .is('removed_at', null);

    for (const listing of dbListings || []) {
      if (!currentExternalIds.has(listing.external_id)) {
        await supabaseAdmin
          .from('job_listings')
          .update({ removed_at: new Date().toISOString() })
          .eq('id', listing.id);
        result.removed++;
      }
    }

    result.fetch_mode_used = modeUsed;
    await updateSourceAfterScrape(source.id, null, modeUsed, source.fetch_mode);
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Unknown scrape error';
    await updateSourceAfterScrape(source.id, result.error, modeUsed, source.fetch_mode);
  }

  return result;
}

async function updateSourceAfterScrape(
  sourceId: string,
  error: string | null,
  modeUsed: FetchMode,
  currentMode: FetchMode,
) {
  const updates: Record<string, unknown> = {
    last_scraped_at: new Date().toISOString(),
    last_error: error,
    updated_at: new Date().toISOString(),
  };

  // Auto-learn: save the mode that worked
  if (!error && currentMode === 'auto') {
    updates.fetch_mode = modeUsed;
  }
  // Reset to auto if saved mode is failing
  if (error && currentMode !== 'auto') {
    updates.fetch_mode = 'auto';
  }

  await supabaseAdmin.from('job_sources').update(updates).eq('id', sourceId);
}

// ---------------------------------------------------------------------------
// Description enrichment
// ---------------------------------------------------------------------------

export async function enrichNewJobDescriptions(
  sourceId: string,
  fetchMode: FetchMode,
  timeBudgetMs: number,
): Promise<number> {
  const start = Date.now();
  let enriched = 0;

  const { data: jobs, error: queryError } = await supabaseAdmin
    .from('job_listings')
    .select('id, url, description, date_posted')
    .eq('source_id', sourceId)
    .is('removed_at', null)
    .or('description.is.null,date_posted.is.null');

  if (queryError) {
    console.error('[enrich] query failed:', queryError.message);
    return 0;
  }
  if (!jobs || jobs.length === 0) return 0;

  console.log(`[enrich] ${jobs.length} job(s) to enrich for source ${sourceId}`);

  for (const job of jobs) {
    if (Date.now() - start > timeBudgetMs) {
      console.log(`[enrich] time budget exceeded, enriched ${enriched}/${jobs.length}`);
      break;
    }

    try {
      let jsonLdDate: string | null = null;

      // Try JSON-LD extraction first (zero tokens)
      if (!job.date_posted) {
        const html = await fetchRawHtml(job.url);
        if (html) {
          jsonLdDate = isValidDatePosted(extractJsonLdDatePosted(html));
          if (jsonLdDate) console.log(`[enrich] date from JSON-LD for ${job.url}: ${jsonLdDate}`);
        }

        if (jsonLdDate && job.description) {
          await supabaseAdmin
            .from('job_listings')
            .update({ date_posted: jsonLdDate })
            .eq('id', job.id);
          enriched++;
          console.log(`[enrich] enriched job ${job.id} date_posted (JSON-LD only, no AI call)`);
          continue;
        }
      }

      // AI enrichment for description (and date if JSON-LD didn't find one)
      let markdown: string | null = null;

      try {
        markdown = await jinaFetch(job.url);
      } catch (e) {
        console.log(`[enrich] jina fetch failed for ${job.url}: ${e instanceof Error ? e.message : 'unknown'}`);
      }

      if (!markdown) {
        try {
          markdown = await directFetch(job.url);
        } catch (e) {
          console.log(`[enrich] direct fetch also failed for ${job.url}: ${e instanceof Error ? e.message : 'unknown'}`);
          continue;
        }
      }

      console.log(`[enrich] fetched ${markdown.length} chars for ${job.url}`);

      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Below is the markdown content of a job posting page. Return the job description exactly as it appears — include the title, responsibilities, requirements, qualifications, location, and any other details shown. Preserve the original wording. Do NOT add commentary, do NOT say "the description is not available", do NOT describe what the page looks like. If the page contains the job description, return it. If it truly contains no description text at all, return only "N/A".

Also extract the posting date if shown on the page. If found, include it on a separate final line in this exact format: DATE_POSTED: YYYY-MM-DD
Convert relative dates (e.g. "Posted 3 days ago") using today's date: ${new Date().toISOString().split('T')[0]}. Omit the DATE_POSTED line entirely if no date is found.

Page content:\n${markdown.slice(0, 40_000)}`,
          },
        ],
      });

      const text = response.content.find(
        (b): b is Anthropic.TextBlock => b.type === 'text',
      );

      const rawText = text?.text ?? '';
      const dateMatch = rawText.match(/\nDATE_POSTED:\s*(\d{4}-\d{2}-\d{2})\s*$/);
      const aiDate = dateMatch ? isValidDatePosted(dateMatch[1]) : null;
      const cleanText = rawText.replace(/\nDATE_POSTED:\s*\d{4}-\d{2}-\d{2}\s*$/, '').trim();

      const updates: Record<string, unknown> = {};
      if (cleanText && cleanText !== 'N/A' && !job.description) {
        updates.description = cleanText;
      }
      const bestDate = jsonLdDate || aiDate;
      if (bestDate && !job.date_posted) {
        updates.date_posted = bestDate;
      }

      if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('job_listings')
          .update(updates)
          .eq('id', job.id);
        enriched++;
        console.log(`[enrich] enriched job ${job.id}`, Object.keys(updates).join(', '));
      } else {
        console.log(`[enrich] nothing to enrich for ${job.url}`);
      }
    } catch (e) {
      console.error(`[enrich] failed for ${job.url}:`, e instanceof Error ? e.message : e);
    }
  }

  return enriched;
}

// ---------------------------------------------------------------------------
// Scrape all active sources
// ---------------------------------------------------------------------------

const INTER_SOURCE_DELAY_MS = 500;
const MAX_SCRAPE_DURATION_MS = 55_000; // Leave headroom for response

export async function scrapeAllSources(): Promise<ScrapeResult[]> {
  const start = Date.now();
  const results: ScrapeResult[] = [];

  const { data: sources } = await supabaseAdmin
    .from('job_sources')
    .select('*')
    .eq('is_active', true)
    .order('created_at');

  if (!sources || sources.length === 0) return [];

  for (const source of sources) {
    if (Date.now() - start > MAX_SCRAPE_DURATION_MS) {
      results.push({
        source_id: source.id,
        company_name: source.company_name,
        new_listings: 0,
        updated: 0,
        removed: 0,
        total_found: 0,
        country_filtered: 0,
        fetch_mode_used: source.fetch_mode,
        error: 'Skipped — time budget exceeded',
      });
      continue;
    }

    const result = await scrapeSource(source as JobSource);
    results.push(result);

    // Description enrichment with remaining time
    const remaining = MAX_SCRAPE_DURATION_MS - (Date.now() - start);
    if (remaining > 5_000) {
      await enrichNewJobDescriptions(source.id, source.fetch_mode, Math.min(remaining - 3_000, 10_000));
    }

    // Delay between sources
    if (sources.indexOf(source) < sources.length - 1) {
      await new Promise((r) => setTimeout(r, INTER_SOURCE_DELAY_MS));
    }
  }

  return results;
}
