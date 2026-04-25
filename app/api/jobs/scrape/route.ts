import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken, validateSessionToken } from '@/lib/auth';
import { scrapeSource, scrapeAllSources } from '@/lib/scraper';
import { supabaseAdmin } from '@/lib/supabase';
import type { JobSource } from '@/types/recruiter';

export const maxDuration = 120;

function isCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

// GET: Vercel Cron entry point (cron sends GET requests)
export async function GET(request: NextRequest) {
  if (!isCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await scrapeAllSources();
  return NextResponse.json({ results });
}

// POST: Manual trigger from console UI or single-source test scrape
export async function POST(request: NextRequest) {
  if (!isCronAuth(request)) {
    const token = await getSessionToken();
    if (!token || !(await validateSessionToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let sourceId: string | null = null;
  try {
    const body = await request.json();
    sourceId = body.source_id || null;
  } catch {
    // No body — scrape all
  }

  if (sourceId) {
    const { data, error } = await supabaseAdmin
      .from('job_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const result = await scrapeSource(data as JobSource);
    return NextResponse.json({ results: [result] });
  }

  const results = await scrapeAllSources();
  return NextResponse.json({ results });
}
