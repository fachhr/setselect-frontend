import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SeniorityLevel } from '@/types/talentPool';
import {
  getSeniorityLevel,
  getSeniorityYearsRange,
  formatTalentId
} from '@/lib/utils/talentPoolHelpers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const seniority = searchParams.get('seniority') as SeniorityLevel | 'all' | null;
    const cantonsParam = searchParams.get('cantons');
    const salaryMax = searchParams.get('salary_max');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);

    // Build Supabase query
    let query = supabaseAdmin
      .from('user_profiles')
      .select('*');

    // Apply cantons filter
    if (cantonsParam) {
      const cantons = cantonsParam.split(',').map(c => c.trim()).filter(Boolean);
      if (cantons.length > 0) {
        query = query.overlaps('desired_locations', cantons);
      }
    }

    // Apply salary filter
    if (salaryMax) {
      const max = parseInt(salaryMax, 10);
      if (!isNaN(max)) {
        query = query.lte('salary_min', max);
      }
    }

    // Apply Sorting
    if (sortBy === 'experience') {
      query = query.order('years_of_experience', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    // Apply Seniority Filter
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

    // Transform Data
    // We implicitly return an object that has 'skills', even though AnonymizedTalentProfile doesn't specify it.
    const candidates = filteredData.map((profile) => {
      const years = parseFloat(profile.years_of_experience || '0');

      // Extract Top Skills from JSONB 'technical_skills'
      let topSkills: string[] = [];
      if (Array.isArray(profile.technical_skills)) {
        topSkills = profile.technical_skills
          .slice(0, 5)
          .map((s: { name?: string } | string) => (typeof s === 'string' ? s : s.name || ''))
          .filter(Boolean);
      }

      return {
        talent_id: formatTalentId(profile.talent_id || profile.id),
        entry_date: profile.created_at,
        years_of_experience: years,
        preferred_cantons: profile.desired_locations || [],
        salary_range: {
          min: profile.salary_min || null,
          max: profile.salary_max || null,
        },
        seniority_level: getSeniorityLevel(years),
        // We inject this property for the frontend to use
        skills: topSkills
      };
    });

    return NextResponse.json({
      success: true,
      data: { candidates }
    });

  } catch (error) {
    console.error('Talent pool list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch talent pool' },
      { status: 500 }
    );
  }
}