import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  SeniorityLevel
} from '@/types/talentPool';
import {
  getSeniorityLevel,
  getSeniorityYearsRange,
  formatTalentId
} from '@/lib/utils/talentPoolHelpers';

// Format duration from dates (uses current date for current jobs with no end date)
function formatJobDuration(start: string | undefined, end: string | undefined | null): string {
  if (!start) return '';

  const startDate = new Date(start);
  // For current jobs (no end date or "Present"), use current date
  const isCurrent = !end || end.toLowerCase() === 'present';
  const endDate = isCurrent ? new Date() : new Date(end);

  // Validate dates are parseable
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '';

  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                 (endDate.getMonth() - startDate.getMonth());

  if (months < 0) return ''; // Invalid date range

  if (months >= 12) {
    const years = Math.round(months / 12);
    return `${years} yr${years > 1 ? 's' : ''}`;
  }
  return `${months} mo${months > 1 ? 's' : ''}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse params
    const seniority = searchParams.get('seniority') as SeniorityLevel | 'all' | null;
    const cantonsParam = searchParams.get('cantons');
    const salaryMax = searchParams.get('salary_max');
    const languagesParam = searchParams.get('languages');
    const workEligibilityParam = searchParams.get('work_eligibility');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);

    let query = supabaseAdmin.from('talent_profiles').select('*');

    // Only show profiles where parsing is complete
    query = query.not('parsing_completed_at', 'is', null);

    // 1. Filter by Cantons / Locations
    if (cantonsParam) {
      const cantons = cantonsParam.split(',').map(c => c.trim()).filter(Boolean);
      if (cantons.length > 0) {
        query = query.overlaps('desired_locations', cantons);
      }
    }

    // 2. Filter by Salary (FIXED LOGIC)
    // "Show candidates whose MAXIMUM expectation is within my budget"
    if (salaryMax) {
      const max = parseInt(salaryMax, 10);
      if (!isNaN(max)) {
        query = query.lte('salary_max', max);
      }
    }

    // 3. Filter by Languages (candidates must have ALL selected languages)
    // Column is JSONB array of {language, proficiency?} objects — use JSONB containment
    if (languagesParam) {
      const languages = languagesParam.split(',').map(l => l.trim()).filter(Boolean);
      if (languages.length > 0) {
        query = query.contains('languages', languages.map(l => ({ language: l })));
      }
    }

    // 4. Filter by Work Eligibility (candidates match ANY selected eligibility)
    if (workEligibilityParam) {
      const eligibilities = workEligibilityParam.split(',').map(e => e.trim()).filter(Boolean);
      if (eligibilities.length > 0) {
        query = query.in('work_eligibility', eligibilities);
      }
    }

    // 5. Sort
    if (sortBy === 'experience') {
      query = query.order('years_of_experience', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    // 6. Filter by Seniority (In Memory)
    let filteredData = data || [];
    if (seniority && seniority !== 'all') {
      const yearsRange = getSeniorityYearsRange(seniority);
      if (yearsRange) {
        filteredData = filteredData.filter(profile => {
          const years = parseFloat(profile.years_of_experience || '0');
          return yearsRange.max !== null
            ? (years >= yearsRange.min && years <= yearsRange.max)
            : (years >= yearsRange.min);
        });
      }
    }

    // 7. Transform Response
    const candidates = filteredData.map((profile) => {
      const years = parseFloat(profile.years_of_experience || '0');

      // Extract Role - prefer desired_roles, fall back to parsed experience
      let roleStr = 'Professional'; // Default fallback
      if (profile.desired_roles) {
        // Join all roles with comma for display, trimming each one
        roleStr = profile.desired_roles
          .split(';')
          .map((r: string) => r.trim())
          .filter((r: string) => r.length > 0)
          .join(', ');
      } else if (Array.isArray(profile.professional_experience) && profile.professional_experience.length > 0) {
        const mostRecentJob = profile.professional_experience[0];
        if (mostRecentJob && mostRecentJob.positionName) {
          roleStr = mostRecentJob.positionName;
        }
      }

      // Extract Skills
      let topSkills: string[] = [];
      if (Array.isArray(profile.technical_skills)) {
        topSkills = profile.technical_skills
          .slice(0, 5)
          .map((s: { name?: string } | string) => typeof s === 'string' ? s : s.name || '')
          .filter(Boolean);
      }

      // Format Availability
      let availabilityStr = 'Negotiable';
      if (profile.notice_period_months !== undefined && profile.notice_period_months !== null) {
        const months = parseInt(String(profile.notice_period_months));
        if (!isNaN(months)) {
          availabilityStr = months === 0 ? 'Immediate' : `${months} Month${months > 1 ? 's' : ''} Notice`;
        }
      }

      // Extract Education (most recent/highest degree)
      let educationStr: string | null = null;
      if (Array.isArray(profile.education_history) && profile.education_history.length > 0) {
        const mostRecentEdu = profile.education_history[0];
        if (mostRecentEdu) {
          const degree = mostRecentEdu.degreeType || '';
          const field = mostRecentEdu.specificField || mostRecentEdu.generalField || '';
          const institution = mostRecentEdu.universityName || '';
          educationStr = [degree, field, institution].filter(Boolean).join(', ');
        }
      }

      // Extract Previous Roles (anonymized job history)
      let previousRoles: { role: string; duration: string; location?: string }[] = [];
      if (Array.isArray(profile.professional_experience) && profile.professional_experience.length > 0) {
        previousRoles = profile.professional_experience
          .slice(0, 3) // Limit to 3 most recent roles
          .map((job: { positionName?: string; position_short?: string; company_type?: string; city?: string; location?: string; startDate?: string; endDate?: string }) => {
            // Prefer normalized short title, fallback to original
            const position = job.position_short || job.positionName || '';
            if (!position) return null; // Skip jobs without position name

            const duration = formatJobDuration(job.startDate, job.endDate);

            // Only show "@ Company Type" if parser provided company_type
            // No fallback - cleaner to show just position than "Position @ Company"
            const role = job.company_type
              ? `${position} @ ${job.company_type}`
              : position;

            // Support both city (parser schema) and location (legacy data)
            return { role, duration, location: job.city || job.location || undefined };
          })
          .filter((r: { role: string; duration: string } | null): r is { role: string; duration: string } => r !== null);
      }

      return {
        talent_id: formatTalentId(profile.talent_id || profile.id),
        role: roleStr,
        entry_date: profile.created_at,
        years_of_experience: years,
        preferred_cantons: profile.desired_locations || [],
        salary_range: {
          min: profile.salary_min || null,
          max: profile.salary_max || null,
        },
        seniority_level: getSeniorityLevel(years),
        skills: topSkills,
        availability: availabilityStr,
        // New fields
        highlight: profile.highlight || null,
        education: educationStr,
        work_eligibility: profile.work_eligibility || null,
        languages: (profile.languages || []).map((l: { language: string; proficiency?: string }) => l.language),
        functional_expertise: profile.functional_expertise || [],
        desired_roles: profile.desired_roles || null,
        profile_bio: profile.profile_bio || null,
        short_summary: profile.short_summary || null,
        previous_roles: previousRoles.length > 0 ? previousRoles : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: { candidates }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}