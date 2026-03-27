import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { RecruiterStatus, ActivityEntry, RecruiterNote } from '@/types/recruiter';

interface StaleCandidate {
  profile_id: string;
  contact_first_name: string;
  contact_last_name: string;
  status: RecruiterStatus;
  days_stale: number;
  last_activity_at: string;
}

interface PendingSubmission {
  profile_id: string;
  candidate_name: string;
  company_name: string;
  days_pending: number;
  submitted_at: string;
}

interface DashboardResponse {
  pipeline_counts: Record<RecruiterStatus, number>;
  stale_candidates: StaleCandidate[];
  pending_submissions: PendingSubmission[];
  unreviewed_new: { profile_id: string; name: string; days_old: number }[];
  recent_activity: (ActivityEntry & { candidate_name: string })[];
  metrics: {
    avg_days_in_stage: number;
    submission_interview_rate: number;
    placements_mtd: number;
    active_submissions_count: number;
    active_submissions_companies: number;
  };
}

const TERMINAL_STATUSES: RecruiterStatus[] = ['placed', 'rejected'];
const STALE_THRESHOLD_DAYS = 5;

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  try {
    // Parallel queries for all dashboard data
    const [candidatesResult, submissionsResult] = await Promise.all([
      supabaseAdmin
        .from('recruiter_candidates')
        .select(`
          profile_id,
          status,
          notes,
          status_changed_at,
          created_at,
          user_profiles!inner (
            contact_first_name,
            contact_last_name
          )
        `),
      supabaseAdmin
        .from('candidate_submissions')
        .select(`
          id,
          profile_id,
          status,
          submitted_at,
          updated_at,
          submission_companies!inner ( name ),
          user_profiles:profile_id!inner (
            contact_first_name,
            contact_last_name
          )
        `),
    ]);

    if (candidatesResult.error) {
      return NextResponse.json({ error: candidatesResult.error.message }, { status: 500 });
    }
    if (submissionsResult.error) {
      return NextResponse.json({ error: submissionsResult.error.message }, { status: 500 });
    }

    const candidates = candidatesResult.data || [];
    const submissions = submissionsResult.data || [];

    // Pipeline counts
    const pipeline_counts: Record<string, number> = {
      new: 0, screening: 0, interviewing: 0, offer: 0, placed: 0, rejected: 0,
    };
    for (const c of candidates) {
      pipeline_counts[c.status] = (pipeline_counts[c.status] || 0) + 1;
    }

    // Stale candidates: in non-terminal stage with last_activity_at 5+ days ago
    const stale_candidates: StaleCandidate[] = [];
    for (const c of candidates) {
      if (TERMINAL_STATUSES.includes(c.status)) continue;
      const activityDate = c.status_changed_at || c.created_at;
      const days = daysSince(activityDate);
      if (days >= STALE_THRESHOLD_DAYS) {
        const profile = c.user_profiles as unknown as { contact_first_name: string; contact_last_name: string };
        stale_candidates.push({
          profile_id: c.profile_id,
          contact_first_name: profile.contact_first_name,
          contact_last_name: profile.contact_last_name,
          status: c.status,
          days_stale: days,
          last_activity_at: activityDate,
        });
      }
    }
    stale_candidates.sort((a, b) => b.days_stale - a.days_stale);

    // Pending submissions: status "submitted" with no update for 5+ days
    const pending_submissions: PendingSubmission[] = [];
    for (const s of submissions) {
      if (s.status !== 'submitted') continue;
      const days = daysSince(s.updated_at || s.submitted_at);
      if (days >= STALE_THRESHOLD_DAYS) {
        const profile = s.user_profiles as unknown as { contact_first_name: string; contact_last_name: string };
        const company = s.submission_companies as unknown as { name: string };
        pending_submissions.push({
          profile_id: s.profile_id,
          candidate_name: `${profile.contact_first_name} ${profile.contact_last_name}`,
          company_name: company.name,
          days_pending: days,
          submitted_at: s.submitted_at,
        });
      }
    }
    pending_submissions.sort((a, b) => b.days_pending - a.days_pending);

    // Unreviewed new candidates: status "new", empty/no notes, 2+ days old
    const unreviewed_new: { profile_id: string; name: string; days_old: number }[] = [];
    for (const c of candidates) {
      if (c.status !== 'new') continue;
      const notes = (c.notes || []) as (RecruiterNote | ActivityEntry)[];
      if (notes.length > 0) continue;
      const days = daysSince(c.created_at);
      if (days >= 2) {
        const profile = c.user_profiles as unknown as { contact_first_name: string; contact_last_name: string };
        unreviewed_new.push({
          profile_id: c.profile_id,
          name: `${profile.contact_first_name} ${profile.contact_last_name}`,
          days_old: days,
        });
      }
    }

    // Recent activity: last 48h from all candidates' notes arrays
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const recent_activity: (ActivityEntry & { candidate_name: string })[] = [];
    for (const c of candidates) {
      const profile = c.user_profiles as unknown as { contact_first_name: string; contact_last_name: string };
      const candidateName = `${profile.contact_first_name} ${profile.contact_last_name}`;
      const notes = (c.notes || []) as (RecruiterNote | ActivityEntry)[];
      for (const note of notes) {
        if (note.created_at >= cutoff) {
          const entry: ActivityEntry = 'type' in note
            ? note as ActivityEntry
            : { ...note, type: 'note' as const };
          recent_activity.push({ ...entry, candidate_name: candidateName });
        }
      }
    }
    recent_activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Metrics
    const activeCandidates = candidates.filter(c => !TERMINAL_STATUSES.includes(c.status));
    const avgDaysInStage = activeCandidates.length > 0
      ? activeCandidates.reduce((sum, c) => sum + daysSince(c.status_changed_at), 0) / activeCandidates.length
      : 0;

    const totalSubmissions = submissions.length;
    const interviewedOrPlaced = submissions.filter(s => s.status === 'interviewing' || s.status === 'placed').length;
    const submissionInterviewRate = totalSubmissions > 0
      ? Math.round((interviewedOrPlaced / totalSubmissions) * 100)
      : 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const placementsMtd = submissions.filter(
      s => s.status === 'placed' && new Date(s.updated_at) >= startOfMonth
    ).length;

    const activeSubmissions = submissions.filter(s => s.status === 'submitted' || s.status === 'interviewing');
    const activeCompanies = new Set(activeSubmissions.map(s => {
      const company = s.submission_companies as unknown as { name: string };
      return company.name;
    }));

    const response: DashboardResponse = {
      pipeline_counts: pipeline_counts as Record<RecruiterStatus, number>,
      stale_candidates,
      pending_submissions,
      unreviewed_new,
      recent_activity: recent_activity.slice(0, 20),
      metrics: {
        avg_days_in_stage: Math.round(avgDaysInStage * 10) / 10,
        submission_interview_rate: submissionInterviewRate,
        placements_mtd: placementsMtd,
        active_submissions_count: activeSubmissions.length,
        active_submissions_companies: activeCompanies.size,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('Dashboard GET error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
