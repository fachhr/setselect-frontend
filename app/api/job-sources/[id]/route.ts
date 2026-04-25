import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const allowed = ['company_name', 'career_url', 'is_active'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if ('target_countries' in body) {
    if (!Array.isArray(body.target_countries)) {
      return NextResponse.json({ error: 'target_countries must be an array' }, { status: 400 });
    }
    updates.target_countries = body.target_countries.map((c: string) => String(c).trim()).filter(Boolean);
  }

  if (updates.career_url) {
    try {
      const parsed = new URL(updates.career_url as string);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: 'URL must use http or https' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from('job_sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 });
  }

  return NextResponse.json({ source: data });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('job_sources')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
