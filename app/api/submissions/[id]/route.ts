import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { SubmissionStatus, SubmissionUpdateEntry, ActivityEntry } from '@/types/recruiter';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_STATUSES: SubmissionStatus[] = ['submitted', 'interviewing', 'rejected', 'placed'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // If status is changing, read current submission data before updating
    let oldStatus: SubmissionStatus | undefined;
    let submissionProfileId: string | undefined;
    let companyName: string | undefined;

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }

      // Read current submission to get old status, profile_id, and company name
      const { data: currentSubmission, error: fetchErr } = await supabaseAdmin
        .from('candidate_submissions')
        .select('status, profile_id, submission_companies!inner(name)')
        .eq('id', id)
        .single();

      if (fetchErr) {
        console.error('Failed to fetch current submission:', fetchErr);
        return NextResponse.json({ error: fetchErr.message }, { status: 500 });
      }

      oldStatus = currentSubmission?.status as SubmissionStatus;
      submissionProfileId = currentSubmission?.profile_id;
      const company = Array.isArray(currentSubmission?.submission_companies)
        ? currentSubmission.submission_companies[0]
        : currentSubmission?.submission_companies;
      companyName = (company as Record<string, unknown>)?.name as string || 'Unknown';

      updates.status = body.status;
    }

    if (body.notes !== undefined) {
      if (body.notes !== null && typeof body.notes !== 'string') {
        return NextResponse.json({ error: 'notes must be a string or null' }, { status: 400 });
      }
      updates.notes = body.notes;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('candidate_submissions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Submission update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Best-effort: log submission status change to candidate's activity feed
    const newStatus = body.status as SubmissionStatus | undefined;
    if (oldStatus && newStatus && oldStatus !== newStatus && submissionProfileId) {
      try {
        const { data: candidateRow } = await supabaseAdmin
          .from('recruiter_candidates')
          .select('notes')
          .eq('profile_id', submissionProfileId)
          .single();

        const existingNotes: ActivityEntry[] = candidateRow?.notes || [];
        const activityEntry: SubmissionUpdateEntry = {
          type: 'submission_update',
          id: crypto.randomUUID(),
          company_name: companyName!,
          submission_id: id,
          from: oldStatus,
          to: newStatus,
          author: 'System',
          created_at: new Date().toISOString(),
        };

        await supabaseAdmin
          .from('recruiter_candidates')
          .update({ notes: [activityEntry, ...existingNotes], updated_at: new Date().toISOString() })
          .eq('profile_id', submissionProfileId);
      } catch (noteErr) {
        console.warn('Failed to log submission status change activity (non-blocking):', noteErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Submission PATCH error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('candidate_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Submission delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Submission DELETE error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
