import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES = ['new', 'evaluating', 'pursuing', 'passed'];

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from('job_listings')
    .update({ status: body.status })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
