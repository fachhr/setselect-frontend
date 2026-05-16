import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

// GET — return the latest 50 notifications, newest first.
export async function GET() {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('job_notifications')
    .select('id, listing_id, source_id, event_type, title, company_name, url, location, seniority, date_posted, created_at, read_at, job_sources(target_countries)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const notifications = (data ?? []).map((row: Record<string, unknown>) => {
    const source = row.job_sources as { target_countries: string[] } | null;
    const { job_sources: _, ...rest } = row;
    return { ...rest, markets: source?.target_countries ?? [] };
  });

  return NextResponse.json({ notifications });
}

// PATCH — mark all unread as read.
export async function PATCH() {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from('job_notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
