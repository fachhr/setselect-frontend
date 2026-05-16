import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecruiterStatus, SubmissionStatus, StatusChangeEntry, ActivityEntry } from '@/types/recruiter';

const STATUS_PRIORITY: Record<string, number> = {
  placed: 4,
  offer: 3,
  interviewing: 2,
  submitted: 1,
  rejected: 0,
};

function deriveStatus(submissions: { status: SubmissionStatus }[]): RecruiterStatus | null {
  if (submissions.length === 0) return null;

  const allRejected = submissions.every(s => s.status === 'rejected');
  if (allRejected) return 'rejected';

  let highest = 0;
  for (const s of submissions) {
    const p = STATUS_PRIORITY[s.status] ?? 0;
    if (p > highest) highest = p;
  }

  if (highest >= 4) return 'placed';
  if (highest >= 3) return 'offer';
  if (highest >= 2) return 'interviewing';

  return 'screening';
}

export async function syncCandidateStatus(
  supabase: SupabaseClient,
  profileId: string,
  drivingCompanyName?: string,
): Promise<void> {
  const { data: submissions } = await supabase
    .from('candidate_submissions')
    .select('status')
    .eq('profile_id', profileId);

  const derived = deriveStatus((submissions ?? []) as { status: SubmissionStatus }[]);
  if (!derived) return;

  const { data: current } = await supabase
    .from('recruiter_candidates')
    .select('status, notes')
    .eq('profile_id', profileId)
    .single();

  if (!current || current.status === derived) return;

  const now = new Date().toISOString();
  const existingNotes: ActivityEntry[] = current.notes || [];
  const statusEntry: StatusChangeEntry = {
    type: 'status_change',
    id: crypto.randomUUID(),
    from: current.status as RecruiterStatus,
    to: derived,
    author: drivingCompanyName ? `Auto (${drivingCompanyName})` : 'Auto',
    created_at: now,
  };

  await supabase
    .from('recruiter_candidates')
    .update({
      status: derived,
      status_changed_at: now,
      updated_at: now,
      last_activity_at: now,
      notes: [statusEntry, ...existingNotes],
    })
    .eq('profile_id', profileId);
}
