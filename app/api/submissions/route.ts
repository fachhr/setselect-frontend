import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { CandidateSubmission, SubmissionStatus, SubmissionCreatedEntry, ActivityEntry } from '@/types/recruiter';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_STATUSES: SubmissionStatus[] = ['submitted', 'interviewing', 'rejected', 'placed'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profile_id');
  const companyId = searchParams.get('company_id');

  if (!profileId && !companyId) {
    return NextResponse.json(
      { error: 'Either profile_id or company_id query parameter is required' },
      { status: 400 }
    );
  }

  try {
    let query = supabaseAdmin
      .from('candidate_submissions')
      .select('*, submission_companies!inner(name)')
      .order('submitted_at', { ascending: false });

    if (profileId) {
      if (!UUID_RE.test(profileId)) {
        return NextResponse.json({ error: 'Invalid profile_id format' }, { status: 400 });
      }
      query = query.eq('profile_id', profileId);
    }

    if (companyId) {
      if (!UUID_RE.test(companyId)) {
        return NextResponse.json({ error: 'Invalid company_id format' }, { status: 400 });
      }
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Submissions query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const submissions: CandidateSubmission[] = (data || []).map((row) => {
      const company = Array.isArray(row.submission_companies)
        ? row.submission_companies[0]
        : row.submission_companies;

      return {
        id: row.id,
        profile_id: row.profile_id,
        company_id: row.company_id,
        company_name: company?.name || 'Unknown',
        submitted_by: row.submitted_by,
        status: row.status,
        notes: row.notes,
        submitted_at: row.submitted_at,
        updated_at: row.updated_at,
      };
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error('Submissions GET error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { profile_id, company_id, submitted_by, notes } = body;

    if (!profile_id || !UUID_RE.test(profile_id)) {
      return NextResponse.json({ error: 'Valid profile_id is required' }, { status: 400 });
    }
    if (!company_id || !UUID_RE.test(company_id)) {
      return NextResponse.json({ error: 'Valid company_id is required' }, { status: 400 });
    }
    if (submitted_by !== undefined && typeof submitted_by !== 'string') {
      return NextResponse.json({ error: 'submitted_by must be a string' }, { status: 400 });
    }
    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      return NextResponse.json({ error: 'notes must be a string' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('candidate_submissions')
      .insert({
        profile_id,
        company_id,
        submitted_by: submitted_by || null,
        notes: notes || null,
        status: 'submitted' as SubmissionStatus,
      })
      .select('*, submission_companies!inner(name)')
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This candidate has already been submitted to this company' },
          { status: 409 }
        );
      }
      console.error('Submission insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const company = Array.isArray(data.submission_companies)
      ? data.submission_companies[0]
      : data.submission_companies;

    const submission: CandidateSubmission = {
      id: data.id,
      profile_id: data.profile_id,
      company_id: data.company_id,
      company_name: company?.name || 'Unknown',
      submitted_by: data.submitted_by,
      status: data.status,
      notes: data.notes,
      submitted_at: data.submitted_at,
      updated_at: data.updated_at,
    };

    // Best-effort: log submission creation to candidate's activity feed
    try {
      const { data: candidateRow } = await supabaseAdmin
        .from('recruiter_candidates')
        .select('notes')
        .eq('profile_id', profile_id)
        .single();

      const existingNotes: ActivityEntry[] = candidateRow?.notes || [];
      const activityEntry: SubmissionCreatedEntry = {
        type: 'submission_created',
        id: crypto.randomUUID(),
        company_name: submission.company_name,
        submission_id: submission.id,
        author: submitted_by || 'System',
        created_at: new Date().toISOString(),
      };

      await supabaseAdmin
        .from('recruiter_candidates')
        .update({ notes: [activityEntry, ...existingNotes], updated_at: new Date().toISOString() })
        .eq('profile_id', profile_id);
    } catch (noteErr) {
      console.warn('Failed to log submission creation activity (non-blocking):', noteErr);
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error('Submissions POST error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
