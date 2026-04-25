import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

export async function GET() {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { count, error } = await supabaseAdmin
    .from('job_listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')
    .is('removed_at', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ new_count: count ?? 0 });
}
