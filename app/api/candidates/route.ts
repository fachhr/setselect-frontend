import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { RecruiterCandidateView, RecruiterStats } from '@/types/recruiter';

/**
 * Sanitize search input to prevent PostgREST filter injection.
 * Strips characters that have special meaning in PostgREST .or() filters.
 */
function sanitizeSearch(raw: string): string {
  return raw.replace(/[,()\\]/g, '').trim();
}

/**
 * Build a PostgREST `.or()` filter string for candidate search.
 * Searches 10 fields with smart handling for ref IDs and phone numbers.
 */
function buildSearchFilter(rawSearch: string): string {
  const search = sanitizeSearch(rawSearch);
  if (!search) return '';

  // Base ilike clauses for all 10 fields
  const clauses: string[] = [
    `contact_first_name.ilike.%${search}%`,
    `contact_last_name.ilike.%${search}%`,
    `email.ilike.%${search}%`,
    `desired_roles.ilike.%${search}%`,
    `talent_id.ilike.%${search}%`,
    `phoneNumber.ilike.%${search}%`,
    `work_eligibility.ilike.%${search}%`,
    `highlight.ilike.%${search}%`,
    `short_summary.ilike.%${search}%`,
    `profile_bio.ilike.%${search}%`,
  ];

  // Smart ref ID search: "SL-042", "REF-42", or bare number "42" → extract digits
  const refIdMatch = search.match(/^(?:SL|REF|ref|sl)[- ]?(\d+)$/i) || search.match(/^(\d{1,6})$/);
  if (refIdMatch) {
    const digits = refIdMatch[1];
    // Add a targeted clause that matches the numeric portion of talent_id
    clauses.push(`talent_id.ilike.%${digits}%`);
  }

  // Phone normalization: strip spaces, dashes, parens, leading zero
  const phoneDigits = search.replace(/[\s\-().+]/g, '');
  if (phoneDigits.length >= 4 && /^\d+$/.test(phoneDigits)) {
    const normalized = phoneDigits.replace(/^0+/, '');
    if (normalized !== search) {
      clauses.push(`phoneNumber.ilike.%${normalized}%`);
    }
  }

  return clauses.join(',');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = searchParams.get('limit') || '20';
  const limit = parseInt(limitParam, 10);
  const fetchAll = limit === 0;
  const offset = (page - 1) * (fetchAll ? 1 : limit);

  try {
    // Build query joining user_profiles with recruiter_candidates
    let query = supabaseAdmin
      .from('user_profiles')
      .select(
        `
        id,
        talent_id,
        contact_first_name,
        contact_last_name,
        email,
        country_code,
        phoneNumber,
        linkedinUrl,
        years_of_experience,
        desired_roles,
        desired_locations,
        salary_min,
        salary_max,
        cv_storage_path,
        cv_original_filename,
        profile_bio,
        short_summary,
        education_history,
        professional_experience,
        technical_skills,
        functional_expertise,
        languages,
        work_eligibility,
        notice_period_months,
        highlight,
        parsing_completed_at,
        created_at,
        recruiter_candidates!inner(
          status,
          owner,
          notes,
          status_changed_at
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Apply search filter
    const searchFilter = buildSearchFilter(search);
    if (searchFilter) {
      query = query.or(searchFilter);
    }

    // Apply status filter
    if (status) {
      query = query.eq('recruiter_candidates.status', status);
    }

    // Apply pagination (skip when fetching all)
    if (!fetchAll) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to flat structure
    const candidates: RecruiterCandidateView[] = (data || []).map((row) => {
      const rc = Array.isArray(row.recruiter_candidates)
        ? row.recruiter_candidates[0]
        : row.recruiter_candidates;

      return {
        profile_id: row.id,
        talent_id: row.talent_id,
        contact_first_name: row.contact_first_name,
        contact_last_name: row.contact_last_name,
        email: row.email,
        country_code: row.country_code || '',
        phoneNumber: row.phoneNumber || '',
        linkedinUrl: row.linkedinUrl,
        years_of_experience: row.years_of_experience,
        desired_roles: row.desired_roles,
        desired_locations: row.desired_locations || [],
        salary_min: row.salary_min,
        salary_max: row.salary_max,
        cv_storage_path: row.cv_storage_path || '',
        cv_original_filename: row.cv_original_filename || '',
        profile_bio: row.profile_bio,
        short_summary: row.short_summary,
        education_history: row.education_history,
        professional_experience: row.professional_experience,
        technical_skills: row.technical_skills,
        functional_expertise: row.functional_expertise,
        languages: Array.isArray(row.languages)
          ? row.languages.map((l: unknown) =>
              typeof l === 'string' ? l : (l as Record<string, string>).language
            )
          : null,
        work_eligibility: row.work_eligibility,
        notice_period_months: row.notice_period_months || '',
        highlight: row.highlight,
        parsing_completed_at: row.parsing_completed_at,
        profile_created_at: row.created_at,
        status: rc?.status || 'new',
        owner: rc?.owner || null,
        notes: rc?.notes || [],
        status_changed_at: rc?.status_changed_at || row.created_at,
      };
    });

    // Calculate stats (separate query for accurate counts)
    const { data: allCandidates } = await supabaseAdmin
      .from('recruiter_candidates')
      .select('status, created_at');

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: RecruiterStats = {
      total: allCandidates?.length || 0,
      active:
        allCandidates?.filter((c) =>
          ['screening', 'interviewing', 'offer'].includes(c.status)
        ).length || 0,
      placed: allCandidates?.filter((c) => c.status === 'placed').length || 0,
      newThisWeek:
        allCandidates?.filter(
          (c) => new Date(c.created_at) >= weekAgo
        ).length || 0,
    };

    const totalCount = count || 0;

    return NextResponse.json({
      candidates,
      stats,
      pagination: fetchAll
        ? { page: 1, limit: totalCount, total: totalCount, totalPages: 1 }
        : { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (err) {
    console.error('Candidates API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
