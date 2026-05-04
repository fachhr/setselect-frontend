import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

export async function GET() {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [totalResult, newResult] = await Promise.all([
    supabaseAdmin
      .from('job_listings')
      .select('id', { count: 'exact', head: true })
      .is('removed_at', null),
    supabaseAdmin
      .from('job_listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
      .is('removed_at', null),
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
