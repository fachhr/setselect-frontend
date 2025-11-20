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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse params
    const seniority = searchParams.get('seniority') as SeniorityLevel | 'all' | null;
    const cantonsParam = searchParams.get('cantons');
    const salaryMax = searchParams.get('salary_max');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);

    let query = supabaseAdmin.from('user_profiles').select('*');

    // 1. Filter by Cantons
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
        // Changed from 'salary_min' to 'salary_max'
        query = query.lte('salary_max', max);
      }
    }

    // 3. Sort
    if (sortBy === 'experience') {
      query = query.order('years_of_experience', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    // 4. Filter by Seniority (In Memory)
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

    // 5. Transform Response
    const candidates = filteredData.map((profile) => {
      const years = parseFloat(profile.years_of_experience || '0');

      // Extract Role (most recent job title)
      let roleStr = 'Professional'; // Default fallback
      if (Array.isArray(profile.professional_experience) && profile.professional_experience.length > 0) {
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
        availability: availabilityStr
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