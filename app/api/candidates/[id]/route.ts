import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { RecruiterStatus } from '@/types/recruiter';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_STATUSES: RecruiterStatus[] = [
  'new',
  'screening',
  'interviewing',
  'offer',
  'placed',
  'rejected',
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = body.status;
      updates.status_changed_at = new Date().toISOString();
    }

    if (body.owner !== undefined) {
      updates.owner = body.owner;
    }

    const { data, error } = await supabaseAdmin
      .from('recruiter_candidates')
      .update(updates)
      .eq('profile_id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('PATCH error:', err);
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
    // Fetch CV path before deleting the profile
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('cv_storage_path')
      .eq('id', id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Best-effort: delete CV from storage
    if (profile.cv_storage_path) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('talent-pool-cvs')
        .remove([profile.cv_storage_path]);

      if (storageError) {
        console.error('Storage deletion failed (non-blocking):', storageError);
      }
    }

    // Delete profile row (cascades to recruiter_candidates)
    const { error: deleteError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
