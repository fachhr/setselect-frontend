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
  description: string | null;
  seniority: JobSeniority | null;
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
            description: { type: ['string', 'null'], description: 'Job description or summary if available on the listing page' },
            seniority: {
              type: ['string', 'null'],
              enum: ['junior', 'mid', 'senior', 'executive', 'c-suite', null],
              description: 'Classify seniority from title and description. junior=entry/intern/associate, mid=analyst/specialist, senior=senior/lead/principal, executive=VP/director/head, c-suite=C-level/president/partner',
            },
          },
          required: ['title', 'url'],
        },
      },
    },
    required: ['jobs'],
  },
};

export async function extractJobListings(
  markdown: string,
  companyName: string,
  careerUrl: string,
  targetCountries?: string[],
): Promise<ExtractedJob[]> {
  const client = getAnthropicClient();

  const truncated = markdown.slice(0, 80_000);

  const countryHint = targetCountries && targetCountries.length > 0
    ? `\n- We are primarily interested in jobs in: ${targetCountries.join(', ')}. Extract all jobs you find but make sure to identify each job's country accurately — we filter by country in code.`
    : '';

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    tools: [EXTRACTION_TOOL],
    tool_choice: { type: 'tool', name: 'submit_jobs' },
    messages: [
      {
        role: 'user',
        content: `Extract job listings from this ${companyName} career page (${careerUrl}).

Rules:
- For URLs: if relative, resolve against the base URL ${new URL(careerUrl).origin}
- For each job, identify the country from its location. Use the full English country name (e.g. "Switzerland", "Germany", "United States").
- For seniority: classify based on title and any description context
- If no jobs are found, return an empty array
- Do NOT invent jobs — only extract what is actually on the page${countryHint}

Page content:
${truncated}`,
      },
    ],
  });

  const toolBlock = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
  );
  if (!toolBlock) return [];

  const input = toolBlock.input as { jobs: ExtractedJob[] };
  return (input.jobs || []).filter((j) => j.title && j.url);
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
    // Stage 1: try direct fetch (unless source is jina-only)
    if (source.fetch_mode !== 'jina') {
      try {
        const markdown = await directFetch(source.career_url);
        allExtracted = await extractJobListings(markdown, source.company_name, source.career_url, source.target_countries);
        modeUsed = 'direct';
      } catch {
        if (source.fetch_mode === 'direct') throw new Error('Direct fetch failed');
      }
    }

    // Stage 2: Jina fallback — only when page returned 0 total jobs (fetch/render issue, not filtering)
    if (allExtracted.length === 0 && source.fetch_mode !== 'direct') {
      const markdown = await jinaFetch(source.career_url);
      allExtracted = await extractJobListings(markdown, source.company_name, source.career_url, source.target_countries);
      modeUsed = 'jina';
    }

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
        .select('id, removed_at')
        .eq('source_id', source.id)
        .eq('external_id', externalId)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from('job_listings')
          .update({
            last_seen_at: new Date().toISOString(),
            removed_at: null,
            ...(job.description && { description: job.description }),
            ...(job.seniority && { seniority: job.seniority }),
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
          description: job.description,
          seniority: job.seniority,
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

  const { data: jobs } = await supabaseAdmin
    .from('job_listings')
    .select('id, url, description')
    .eq('source_id', sourceId)
    .is('removed_at', null)
    .or('description.is.null,description.eq.');

  if (!jobs || jobs.length === 0) return 0;

  const resolvedMode = fetchMode === 'auto' ? 'direct' : fetchMode;

  for (const job of jobs) {
    if (Date.now() - start > timeBudgetMs) break;

    try {
      const markdown =
        resolvedMode === 'jina'
          ? await jinaFetch(job.url)
          : await directFetch(job.url);

      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Below is the markdown content of a job posting page. Return the job description exactly as it appears — include the title, responsibilities, requirements, qualifications, location, and any other details shown. Preserve the original wording. Do NOT add commentary, do NOT say "the description is not available", do NOT describe what the page looks like. If the page contains the job description, return it. If it truly contains no description text at all, return only "N/A".\n\nPage content:\n${markdown.slice(0, 40_000)}`,
          },
        ],
      });

      const text = response.content.find(
        (b): b is Anthropic.TextBlock => b.type === 'text',
      );
      if (text?.text && text.text.trim() !== 'N/A') {
        await supabaseAdmin
          .from('job_listings')
          .update({ description: text.text })
          .eq('id', job.id);
        enriched++;
      }
    } catch {
      // Skip failed enrichments silently — not critical
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
    if (remaining > 5_000 && result.new_listings > 0) {
      await enrichNewJobDescriptions(source.id, source.fetch_mode, Math.min(remaining - 3_000, 10_000));
    }

    // Delay between sources
    if (sources.indexOf(source) < sources.length - 1) {
      await new Promise((r) => setTimeout(r, INTER_SOURCE_DELAY_MS));
    }
  }

  return results;
}
