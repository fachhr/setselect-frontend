import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { SubmissionCompany } from '@/types/recruiter';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('submission_companies')
      .select('id, name, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('Submission companies query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const companies: SubmissionCompany[] = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      created_at: row.created_at,
    }));

    return NextResponse.json({ companies });
  } catch (err) {
    console.error('Submission companies GET error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('submission_companies')
      .insert({ name })
      .select('id, name, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A company with this name already exists' },
          { status: 409 }
        );
      }
      console.error('Submission company insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const company: SubmissionCompany = {
      id: data.id,
      name: data.name,
      created_at: data.created_at,
    };

    return NextResponse.json({ company }, { status: 201 });
  } catch (err) {
    console.error('Submission companies POST error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
