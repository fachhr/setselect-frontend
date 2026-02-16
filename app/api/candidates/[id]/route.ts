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

const PROFILE_FIELDS = new Set([
  'contact_first_name',
  'contact_last_name',
  'email',
  'country_code',
  'phoneNumber',
  'linkedinUrl',
  'years_of_experience',
  'desired_roles',
  'desired_locations',
  'salary_min',
  'salary_max',
  'notice_period_months',
  'work_eligibility',
  'short_summary',
  'functional_expertise',
  'base_languages',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateProfileFields(fields: Record<string, unknown>): string | null {
  if ('contact_first_name' in fields && (!fields.contact_first_name || typeof fields.contact_first_name !== 'string')) {
    return 'First name is required';
  }
  if ('contact_last_name' in fields && (!fields.contact_last_name || typeof fields.contact_last_name !== 'string')) {
    return 'Last name is required';
  }
  if ('email' in fields) {
    if (!fields.email || typeof fields.email !== 'string' || !EMAIL_RE.test(fields.email)) {
      return 'Valid email is required';
    }
  }
  for (const key of ['years_of_experience', 'salary_min', 'salary_max'] as const) {
    if (key in fields && fields[key] !== null) {
      const val = Number(fields[key]);
      if (isNaN(val) || val < 0) return `${key} must be a non-negative number or null`;
    }
  }
  for (const key of ['desired_locations', 'functional_expertise', 'base_languages'] as const) {
    if (key in fields && fields[key] !== null) {
      if (!Array.isArray(fields[key])) return `${key} must be an array or null`;
    }
  }
  return null;
}

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

    // Partition into recruiter fields and profile fields
    const recruiterUpdates: Record<string, unknown> = {};
    const profileUpdates: Record<string, unknown> = {};
    let hasRecruiterUpdates = false;
    let hasProfileUpdates = false;

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      recruiterUpdates.status = body.status;
      recruiterUpdates.status_changed_at = new Date().toISOString();
      hasRecruiterUpdates = true;
    }

    if (body.owner !== undefined) {
      recruiterUpdates.owner = body.owner;
      hasRecruiterUpdates = true;
    }

    for (const key of Object.keys(body)) {
      if (PROFILE_FIELDS.has(key)) {
        profileUpdates[key] = body[key];
        hasProfileUpdates = true;
      }
    }

    // Validate profile fields
    if (hasProfileUpdates) {
      const validationError = validateProfileFields(profileUpdates);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    // Update recruiter_candidates if needed
    if (hasRecruiterUpdates) {
      recruiterUpdates.updated_at = new Date().toISOString();
      const { error } = await supabaseAdmin
        .from('recruiter_candidates')
        .update(recruiterUpdates)
        .eq('profile_id', id);

      if (error) {
        console.error('Recruiter update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Update user_profiles if needed
    if (hasProfileUpdates) {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', id);

      if (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
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
