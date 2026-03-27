'use client';

import { useState } from 'react';
import type { RecruiterCandidateView, RecruiterStatus, CandidateSubmission } from '@/types/recruiter';

interface BoardViewProps {
  candidates: RecruiterCandidateView[];
  submissions: CandidateSubmission[];
  onSelect: (candidate: RecruiterCandidateView) => void;
}

const STAGES: { key: RecruiterStatus; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'var(--status-new)' },
  { key: 'screening', label: 'Screening', color: 'var(--status-screening)' },
  { key: 'interviewing', label: 'Interviewing', color: 'var(--status-interviewing)' },
  { key: 'offer', label: 'Offer', color: 'var(--status-offer)' },
  { key: 'placed', label: 'Placed', color: 'var(--status-placed)' },
];

const STALE_AMBER_DAYS = 5;
const STALE_RED_DAYS = 7;
const MAX_VISIBLE_CARDS = 4;

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function submissionDotColor(status: string): string {
  switch (status) {
    case 'submitted': return 'var(--status-new)';
    case 'interviewing': return 'var(--status-interviewing)';
    case 'placed': return 'var(--status-placed)';
    case 'rejected': return 'var(--text-muted)';
    default: return 'var(--text-muted)';
  }
}

export function BoardView({ candidates, submissions, onSelect }: BoardViewProps) {
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

  const toggleColumn = (key: string) => {
    setExpandedColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  // Group submissions by profile_id for quick lookup
  const submissionsByProfile = new Map<string, CandidateSubmission[]>();
  for (const s of submissions) {
    const existing = submissionsByProfile.get(s.profile_id) || [];
    existing.push(s);
    submissionsByProfile.set(s.profile_id, existing);
  }

  // Group candidates by status and sort by staleness
  const grouped = new Map<RecruiterStatus, RecruiterCandidateView[]>();
  for (const stage of STAGES) {
    const stageCandidates = candidates
      .filter(c => c.status === stage.key)
      .sort((a, b) => {
        const daysA = daysSince(a.status_changed_at);
        const daysB = daysSince(b.status_changed_at);
        return daysB - daysA; // most stale first
      });
    grouped.set(stage.key, stageCandidates);
  }

  // Rejected count for collapsed column
  const rejectedCount = candidates.filter(c => c.status === 'rejected').length;

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2">
      {STAGES.map((stage) => {
        const stageCandidates = grouped.get(stage.key) || [];
        const isExpanded = expandedColumns.has(stage.key);
        const visibleCandidates = isExpanded ? stageCandidates : stageCandidates.slice(0, MAX_VISIBLE_CARDS);
        const overflow = stageCandidates.length - MAX_VISIBLE_CARDS;

        return (
          <div
            key={stage.key}
            className="flex-1 min-w-[200px] bg-[var(--bg-nested)] rounded-lg p-2.5 min-h-[300px]"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1.5 py-1.5 mb-2">
              <span
                className="text-[11px] font-semibold uppercase tracking-[1px]"
                style={{ color: stage.color }}
              >
                {stage.label}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-surface-3)] px-1.5 py-0.5 rounded">
                {stageCandidates.length}
              </span>
            </div>

            {/* Cards */}
            {visibleCandidates.length === 0 ? (
              <div className="text-[10px] text-[var(--text-muted)] text-center py-6">
                No candidates
              </div>
            ) : (
              <div className="space-y-1.5">
                {visibleCandidates.map((c) => {
                  const daysInStage = daysSince(c.status_changed_at);
                  const isStaleRed = daysInStage >= STALE_RED_DAYS;
                  const isStaleAmber = daysInStage >= STALE_AMBER_DAYS;
                  const isTerminal = stage.key === 'placed';
                  const profileSubs = submissionsByProfile.get(c.profile_id) || [];

                  return (
                    <button
                      key={c.profile_id}
                      onClick={() => onSelect(c)}
                      className={`w-full text-left bg-[var(--bg-surface-2)] border rounded-lg px-3 py-2.5 cursor-pointer transition-all hover:border-[var(--border-hover)] hover:-translate-y-px hover:shadow-md ${
                        isStaleRed && !isTerminal
                          ? 'border-l-[3px] border-l-[var(--error)] border-t-[var(--border-subtle)] border-r-[var(--border-subtle)] border-b-[var(--border-subtle)]'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {isStaleAmber && !isTerminal && (
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
                            style={{ background: isStaleRed ? 'var(--error)' : 'var(--status-follow-up)' }}
                          />
                        )}
                        {c.contact_first_name} {c.contact_last_name}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)] truncate mt-0.5">
                        {c.desired_roles || 'No role specified'}
                      </div>
                      <div className="flex gap-2 mt-1.5 text-[10px] text-[var(--text-muted)]">
                        {c.desired_locations?.[0] && (
                          <span className="truncate">{c.desired_locations[0]}</span>
                        )}
                        {c.years_of_experience > 0 && (
                          <span>{c.years_of_experience} yrs</span>
                        )}
                      </div>
                      {!isTerminal && (
                        <div className={`text-[9px] mt-1 ${
                          isStaleRed ? 'text-[var(--error)] font-medium' : isStaleAmber ? 'text-[var(--status-follow-up)]' : 'text-[var(--text-muted)]'
                        }`}>
                          {isStaleAmber && '⚠ '}
                          {daysInStage}d in stage
                        </div>
                      )}
                      {isTerminal && (
                        <div className="text-[9px] mt-1 text-[var(--status-placed)]">
                          ✓ Placed
                        </div>
                      )}
                      {/* Submission dots */}
                      {profileSubs.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {profileSubs.map((s) => (
                            <div
                              key={s.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: submissionDotColor(s.status) }}
                              title={`${s.company_name} — ${s.status}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
                {overflow > 0 && (
                  <button
                    onClick={() => toggleColumn(stage.key)}
                    style={{ width: '100%', textAlign: 'center', padding: '6px 0', fontSize: '10px', color: 'var(--text-tertiary)', cursor: 'pointer', background: 'transparent', border: 'none' }}
                    className="hover:text-[var(--text-secondary)]"
                  >
                    {isExpanded ? 'Show less' : `+${overflow} more`}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Collapsed Rejected column */}
      {rejectedCount > 0 && (
        <div className="min-w-[80px] bg-[var(--bg-surface-2)] rounded-lg p-2.5 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--status-rejected)]">
            Rejected
          </span>
          <span className="text-lg font-extrabold text-[var(--text-secondary)] mt-1">
            {rejectedCount}
          </span>
        </div>
      )}
    </div>
  );
}
