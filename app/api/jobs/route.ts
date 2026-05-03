import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const sourceId = searchParams.get('source_id');
  const seniority = searchParams.get('seniority');
  const search = searchParams.get('search');
  const includeRemoved = searchParams.get('include_removed') === 'true';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));

  let query = supabaseAdmin
    .from('job_listings')
    .select('*, job_sources!inner(company_name)', { count: 'exact' });

  // Filter removed
  if (!includeRemoved) {
    query = query.is('removed_at', null);
  }

  // Status filter (comma-separated)
  if (status) {
    const statuses = status.split(',').map((s) => s.trim());
    query = query.in('status', statuses);
  }

  // Source filter
  if (sourceId) {
    query = query.eq('source_id', sourceId);
  }

  // Seniority filter (comma-separated)
  if (seniority) {
    const levels = seniority.split(',').map((s) => s.trim());
    query = query.in('seniority', levels);
  }

  // Text search
  if (search) {
    const sanitized = search.replace(/[,()\\]/g, '').trim();
    if (sanitized) {
      query = query.or(
        `title.ilike.%${sanitized}%,location.ilike.%${sanitized}%`,
      );
    }
  }

  // Pagination
  const from = (page - 1) * limit;
  query = query
    .order('date_posted', { ascending: false, nullsFirst: false })
    .order('first_seen_at', { ascending: false })
    .range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Denormalize company_name
  const listings = (data || []).map((row: Record<string, unknown>) => {
    const source = row.job_sources as { company_name: string } | null;
    const { job_sources: _, ...rest } = row;
    return { ...rest, company_name: source?.company_name ?? '' };
  });

  // Stats — counts must NOT reflect the active filters; they describe the
  // dataset as a whole. Pagination, on the other hand, uses the filtered count.
  const totalQuery = supabaseAdmin
    .from('job_listings')
    .select('id', { count: 'exact', head: true });
  if (!includeRemoved) totalQuery.is('removed_at', null);

  const [totalResult, newCountResult, pursuingCountResult, sourcesCountResult] = await Promise.all([
    totalQuery,
    supabaseAdmin
      .from('job_listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
      .is('removed_at', null),
    supabaseAdmin
      .from('job_listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pursuing')
      .is('removed_at', null),
    supabaseAdmin
      .from('job_sources')
      .select('id', { count: 'exact', head: true }),
  ]);

  const { data: lastScrape } = await supabaseAdmin
    .from('job_sources')
    .select('last_scraped_at')
    .not('last_scraped_at', 'is', null)
    .order('last_scraped_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const filteredCount = count ?? 0;

  return NextResponse.json({
    listings,
    stats: {
      total: totalResult.count ?? 0,
      new_count: newCountResult.count ?? 0,
      pursuing_count: pursuingCountResult.count ?? 0,
      sources_count: sourcesCountResult.count ?? 0,
      last_scrape_at: lastScrape?.last_scraped_at ?? null,
    },
    pagination: {
      page,
      limit,
      total: filteredCount,
      totalPages: Math.ceil(filteredCount / limit),
    },
  });
}
