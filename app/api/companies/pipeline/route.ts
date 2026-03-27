import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface SubmissionRow {
  profile_id: string;
  status: 'submitted' | 'interviewing' | 'rejected' | 'placed';
  submitted_at: string;
  updated_at: string;
  submission_companies: { id: string; name: string } | { id: string; name: string }[];
  user_profiles: { contact_first_name: string; contact_last_name: string } | { contact_first_name: string; contact_last_name: string }[];
}

interface CompanyPipelineData {
  company_id: string;
  company_name: string;
  submissions: {
    profile_id: string;
    candidate_name: string;
    status: 'submitted' | 'interviewing' | 'rejected' | 'placed';
    submitted_at: string;
    updated_at: string;
  }[];
}

const ACTIVE_STATUSES = new Set(['submitted', 'interviewing']);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('candidate_submissions')
      .select(`
        profile_id,
        status,
        submitted_at,
        updated_at,
        submission_companies!inner ( id, name ),
        user_profiles:profile_id!inner (
          contact_first_name,
          contact_last_name
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Pipeline query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []) as unknown as SubmissionRow[];

    // Group submissions by company
    const companyMap = new Map<string, CompanyPipelineData>();

    for (const row of rows) {
      const company = Array.isArray(row.submission_companies)
        ? row.submission_companies[0]
        : row.submission_companies;
      const profile = Array.isArray(row.user_profiles)
        ? row.user_profiles[0]
        : row.user_profiles;

      const companyId = company.id;
      const companyName = company.name;
      const candidateName = `${profile.contact_first_name} ${profile.contact_last_name}`;

      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          company_id: companyId,
          company_name: companyName,
          submissions: [],
        });
      }

      companyMap.get(companyId)!.submissions.push({
        profile_id: row.profile_id,
        candidate_name: candidateName,
        status: row.status,
        submitted_at: row.submitted_at,
        updated_at: row.updated_at,
      });
    }

    // Sort companies by total active submissions descending
    const companies = Array.from(companyMap.values()).sort((a, b) => {
      const activeA = a.submissions.filter(s => ACTIVE_STATUSES.has(s.status)).length;
      const activeB = b.submissions.filter(s => ACTIVE_STATUSES.has(s.status)).length;
      return activeB - activeA;
    });

    return NextResponse.json({ companies });
  } catch (err) {
    console.error('Companies pipeline GET error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
