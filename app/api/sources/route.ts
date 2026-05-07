import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: sources, error } = await supabaseAdmin
    .from('job_sources')
    .select('id, company_name, career_url, coverage_status, coverage_note, last_scraped_at, fetch_mode, platform_hint')
    .eq('is_active', true)
    .order('company_name');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = (sources ?? []).map((s) => s.id);

  // Active listings (currently visible to recruiters).
  const { data: activeRows } = await supabaseAdmin
    .from('job_listings')
    .select('source_id')
    .in('source_id', ids)
    .is('removed_at', null);
  const activeBySource: Record<string, number> = {};
  for (const r of activeRows ?? []) activeBySource[r.source_id] = (activeBySource[r.source_id] ?? 0) + 1;

  // Lifetime listings — used to distinguish "never scraped a job" from
  // "had jobs but they're all closed now".
  const { data: lifetimeRows } = await supabaseAdmin
    .from('job_listings')
    .select('source_id')
    .in('source_id', ids);
  const lifetimeBySource: Record<string, number> = {};
  for (const r of lifetimeRows ?? []) lifetimeBySource[r.source_id] = (lifetimeBySource[r.source_id] ?? 0) + 1;

  const enriched = (sources ?? []).map((s) => ({
    ...s,
    active_count: activeBySource[s.id] ?? 0,
    lifetime_count: lifetimeBySource[s.id] ?? 0,
  }));

  return NextResponse.json({ sources: enriched });
}
