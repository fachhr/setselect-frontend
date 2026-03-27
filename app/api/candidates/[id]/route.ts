import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { RecruiterStatus, StatusChangeEntry, ActivityEntry } from '@/types/recruiter';

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
  'languages',
]);

const TALENT_PROFILE_FIELDS = new Set([
  'years_of_experience',
  'desired_roles',
  'desired_locations',
  'salary_min',
  'salary_max',
  'notice_period_months',
  'work_eligibility',
  'short_summary',
  'functional_expertise',
  'languages',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Fluent', 'Native'];

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
  for (const key of ['desired_locations', 'functional_expertise', 'languages'] as const) {
    if (key in fields && fields[key] !== null) {
      if (!Array.isArray(fields[key])) return `${key} must be an array or null`;
    }
  }
  if ('languages' in fields && Array.isArray(fields.languages)) {
    for (let i = 0; i < (fields.languages as unknown[]).length; i++) {
      const entry = (fields.languages as unknown[])[i] as Record<string, unknown>;
      if (!entry.language || typeof entry.language !== 'string' || !entry.language.trim()) {
        return `languages[${i}]: language name is required`;
      }
      if (entry.proficiency !== undefined && entry.proficiency !== null) {
        if (typeof entry.proficiency !== 'string' || !VALID_PROFICIENCIES.includes(entry.proficiency)) {
          return `languages[${i}]: proficiency must be one of ${VALID_PROFICIENCIES.join(', ')}`;
        }
      }
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

      // Read current status and notes to auto-log the change
      const { data: currentRow, error: fetchErr } = await supabaseAdmin
        .from('recruiter_candidates')
        .select('status, notes')
        .eq('profile_id', id)
        .single();

      if (fetchErr) {
        console.error('Failed to fetch current status:', fetchErr);
        return NextResponse.json({ error: fetchErr.message }, { status: 500 });
      }

      const currentStatus = currentRow?.status as RecruiterStatus | undefined;
      const newStatus = body.status as RecruiterStatus;

      recruiterUpdates.status = newStatus;
      recruiterUpdates.status_changed_at = new Date().toISOString();
      hasRecruiterUpdates = true;

      // Only log if status is actually changing
      if (currentStatus && currentStatus !== newStatus) {
        const existingNotes: ActivityEntry[] = currentRow?.notes || [];
        const statusEntry: StatusChangeEntry = {
          type: 'status_change',
          id: crypto.randomUUID(),
          from: currentStatus,
          to: newStatus,
          author: 'System',
          created_at: new Date().toISOString(),
        };
        recruiterUpdates.notes = [statusEntry, ...existingNotes];
      }
    }

    if (body.owner !== undefined) {
      recruiterUpdates.owner = body.owner;
      hasRecruiterUpdates = true;
    }

    if (body.is_favorite !== undefined) {
      recruiterUpdates.is_favorite = !!body.is_favorite;
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
      recruiterUpdates.last_activity_at = new Date().toISOString();
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

      // Sync non-PII fields to talent_profiles (best-effort)
      const talentProfileUpdates: Record<string, unknown> = {};
      let hasTalentUpdates = false;
      for (const key of Object.keys(profileUpdates)) {
        if (TALENT_PROFILE_FIELDS.has(key)) {
          talentProfileUpdates[key] = profileUpdates[key];
          hasTalentUpdates = true;
        }
      }

      if (hasTalentUpdates) {
        const { error: talentError } = await supabaseAdmin
          .from('talent_profiles')
          .update(talentProfileUpdates)
          .eq('profile_id', id);

        if (talentError) {
          console.warn('talent_profiles sync failed (non-blocking):', talentError);
        }
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
