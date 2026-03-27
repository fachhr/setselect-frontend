'use client';

export interface CompanyPipelineData {
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

interface CompanyPipelineCardProps {
  company: CompanyPipelineData;
}

const STATUS_COLORS: Record<CompanyPipelineData['submissions'][number]['status'], string> = {
  submitted: 'var(--status-new)',
  interviewing: 'var(--status-interviewing)',
  placed: 'var(--status-placed)',
  rejected: 'var(--text-muted)',
};

const STATUS_LABELS: Record<CompanyPipelineData['submissions'][number]['status'], string> = {
  submitted: 'Submitted',
  interviewing: 'Interviewing',
  placed: 'Placed',
  rejected: 'Rejected',
};

const STALE_THRESHOLD_DAYS = 5;

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function isStaleSubmission(submission: CompanyPipelineData['submissions'][number]): boolean {
  return submission.status === 'submitted' && daysSince(submission.updated_at || submission.submitted_at) >= STALE_THRESHOLD_DAYS;
}

export function CompanyPipelineCard({ company }: CompanyPipelineCardProps) {
  const { company_name, submissions } = company;

  const counts = {
    submitted: 0,
    interviewing: 0,
    placed: 0,
    rejected: 0,
  };
  for (const s of submissions) {
    counts[s.status]++;
  }

  const total = submissions.length;

  return (
    <div className="glass-panel rounded-lg p-4 space-y-3">
      {/* Company heading */}
      <h3
        className="font-semibold text-[var(--text-primary)]"
        style={{ fontSize: '15px' }}
      >
        {company_name}
      </h3>

      {/* Stats line */}
      <p className="text-[10px] space-x-3">
        {counts.submitted > 0 && (
          <span style={{ color: STATUS_COLORS.submitted }}>
            {counts.submitted} submitted
          </span>
        )}
        {counts.interviewing > 0 && (
          <span style={{ color: STATUS_COLORS.interviewing }}>
            {counts.interviewing} interviewing
          </span>
        )}
        {counts.placed > 0 && (
          <span style={{ color: STATUS_COLORS.placed }}>
            {counts.placed} placed
          </span>
        )}
      </p>

      {/* Mini pipeline bar */}
      {total > 0 && (
        <div className="flex h-1 rounded-sm overflow-hidden gap-[3px]">
          {(['submitted', 'interviewing', 'placed', 'rejected'] as const).map(status => {
            const count = counts[status];
            if (count === 0) return null;
            const widthPercent = (count / total) * 100;
            return (
              <div
                key={status}
                className="h-full rounded-sm"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: STATUS_COLORS[status],
                  minWidth: '4px',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Candidate chips */}
      <div className="flex flex-wrap gap-1.5">
        {submissions.map(submission => {
          const stale = isStaleSubmission(submission);
          return (
            <div
              key={`${submission.profile_id}-${submission.status}`}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px]
                bg-[var(--bg-surface-2)] border transition-colors
                ${stale
                  ? 'border-[var(--warning)] shadow-[0_0_0_1px_var(--warning)]'
                  : 'border-[var(--border-subtle)]'
                }
              `}
            >
              {/* Status dot */}
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: STATUS_COLORS[submission.status] }}
              />
              {/* Candidate name */}
              <span className="text-[var(--text-primary)] truncate max-w-[160px] sm:max-w-[120px]">
                {submission.candidate_name}
              </span>
              {/* Status label */}
              <span
                className="text-[10px] font-medium uppercase tracking-wide"
                style={{ color: STATUS_COLORS[submission.status] }}
              >
                {STATUS_LABELS[submission.status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
