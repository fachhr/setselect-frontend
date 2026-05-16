import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';
import { MARKETS, type Market, marketToCountry } from '@/lib/markets';

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const marketParam = searchParams.get('market');
  const market: Market | null = marketParam && MARKETS.includes(marketParam as Market)
    ? (marketParam as Market)
    : null;

  function scopedQuery() {
    let q = supabaseAdmin
      .from('job_listings')
      .select('id, job_sources!inner(target_countries)', { count: 'exact', head: true })
      .is('removed_at', null);
    if (market) q = q.contains('job_sources.target_countries', [marketToCountry(market)]);
    return q;
  }

  const [totalResult, newResult] = await Promise.all([
    scopedQuery(),
    scopedQuery().eq('status', 'new'),
  ]);

  if (totalResult.error || newResult.error) {
    return NextResponse.json(
      { error: totalResult.error?.message || newResult.error?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    total: totalResult.count ?? 0,
    new_count: newResult.count ?? 0,
  });
}
