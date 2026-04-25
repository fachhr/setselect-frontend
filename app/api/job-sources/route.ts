import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionToken, validateSessionToken } from '@/lib/auth';

export async function GET() {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('job_sources')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sources: data });
}

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token || !(await validateSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { company_name, career_url, target_countries } = body;

  if (!company_name || !career_url) {
    return NextResponse.json({ error: 'company_name and career_url are required' }, { status: 400 });
  }

  try {
    const parsed = new URL(career_url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'URL must use http or https' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  const insertData: Record<string, unknown> = {
    company_name: company_name.trim(),
    career_url: career_url.trim(),
  };

  if (Array.isArray(target_countries) && target_countries.length > 0) {
    insertData.target_countries = target_countries.map((c: string) => c.trim()).filter(Boolean);
  }

  const { data, error } = await supabaseAdmin
    .from('job_sources')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This career page URL is already being watched' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source: data }, { status: 201 });
}
