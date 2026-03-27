'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import type { RecruiterStatus, ActivityEntry } from '@/types/recruiter';

// --- Types ---

interface StaleCandidate {
  profile_id: string;
  contact_first_name: string;
  contact_last_name: string;
  status: RecruiterStatus;
  days_stale: number;
}

interface PendingSubmission {
  profile_id: string;
  candidate_name: string;
  company_name: string;
  days_pending: number;
}

interface DashboardData {
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

// --- Pipeline Stage Config ---

const STAGES: { key: RecruiterStatus; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'var(--status-new)' },
  { key: 'screening', label: 'Screening', color: 'var(--status-screening)' },
  { key: 'interviewing', label: 'Interviewing', color: 'var(--status-interviewing)' },
  { key: 'offer', label: 'Offer', color: 'var(--status-offer)' },
  { key: 'placed', label: 'Placed', color: 'var(--status-placed)' },
];

// --- Helpers ---

function relativeTime(dateStr: string): string {
  const hours = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function activityDotColor(entry: ActivityEntry): string {
  switch (entry.type) {
    case 'status_change':
      return `var(--status-${entry.to})`;
    case 'submission_created':
      return 'var(--status-new)';
    case 'submission_update':
      return `var(--status-${entry.to === 'interviewing' ? 'interviewing' : entry.to === 'placed' ? 'placed' : entry.to === 'rejected' ? 'rejected' : 'new'})`;
    case 'note':
      return 'var(--status-screening)';
    default:
      return 'var(--text-tertiary)';
  }
}

function activityText(entry: ActivityEntry & { candidate_name: string }): { main: string; sub: string } {
  switch (entry.type) {
    case 'status_change':
      return {
        main: `${entry.candidate_name} → ${entry.to.charAt(0).toUpperCase() + entry.to.slice(1)}`,
        sub: entry.comment || `From ${entry.from}`,
      };
    case 'submission_created':
      return {
        main: `${entry.candidate_name} submitted`,
        sub: `→ ${entry.company_name}`,
      };
    case 'submission_update':
      return {
        main: `${entry.candidate_name} → ${entry.to.charAt(0).toUpperCase() + entry.to.slice(1)}`,
        sub: `at ${entry.company_name}`,
      };
    case 'note':
      return {
        main: `Note on ${entry.candidate_name}`,
        sub: entry.text.length > 80 ? entry.text.slice(0, 80) + '...' : entry.text,
      };
  }
}

// --- Skeleton ---

function PipelineSkeleton() {
  return (
    <div className="flex gap-[2px] rounded-lg overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-1 bg-[var(--bg-surface-1)] p-4 animate-pulse">
          <div className="h-3 w-16 bg-[var(--bg-surface-3)] rounded mb-2" />
          <div className="h-7 w-10 bg-[var(--bg-surface-3)] rounded" />
        </div>
      ))}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-[18px] animate-pulse">
      <div className="h-4 w-32 bg-[var(--bg-surface-3)] rounded mb-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-12 bg-[var(--bg-surface-2)] rounded mb-2" />
      ))}
    </div>
  );
}

// --- Main Component ---

export default function CommandCenterPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build "Needs Attention" items
  const attentionItems: { id: string; severity: 'critical' | 'warning' | 'info'; label: string; name: string; detail: string; profileId: string }[] = [];

  if (data) {
    for (const c of data.stale_candidates) {
      attentionItems.push({
        id: `stale-${c.profile_id}`,
        severity: c.days_stale >= 7 ? 'critical' : 'warning',
        label: `STALE ${c.days_stale}D`,
        name: `${c.contact_first_name} ${c.contact_last_name}`,
        detail: `Stuck in ${c.status.charAt(0).toUpperCase() + c.status.slice(1)} — no activity`,
        profileId: c.profile_id,
      });
    }
    for (const s of data.pending_submissions) {
      attentionItems.push({
        id: `pending-${s.profile_id}-${s.company_name}`,
        severity: s.days_pending >= 7 ? 'critical' : 'warning',
        label: 'FOLLOW UP',
        name: `${s.candidate_name} → ${s.company_name}`,
        detail: `Submission sent ${s.days_pending} days ago — no response`,
        profileId: s.profile_id,
      });
    }
    if (data.unreviewed_new.length > 0) {
      attentionItems.push({
        id: 'unreviewed',
        severity: 'info',
        label: 'REVIEW',
        name: `${data.unreviewed_new.length} new candidate${data.unreviewed_new.length > 1 ? 's' : ''} unreviewed`,
        detail: data.unreviewed_new.map(c => c.name).join(', '),
        profileId: data.unreviewed_new[0].profile_id,
      });
    }
  }

  // Sort: critical first, then warning, then info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  attentionItems.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const severityColor = { critical: 'var(--error)', warning: 'var(--status-follow-up)', info: 'var(--primary)' };
  const severityTextColor = { critical: 'var(--error)', warning: 'var(--status-follow-up)', info: 'var(--text-accent)' };

  // Meta lines for pipeline stages
  function stageMeta(key: RecruiterStatus): string {
    if (!data) return '';
    switch (key) {
      case 'new': {
        const unreviewed = data.unreviewed_new.length;
        return unreviewed > 0 ? `${unreviewed} unreviewed` : 'all reviewed';
      }
      case 'screening':
      case 'interviewing': {
        const stale = data.stale_candidates.filter(c => c.status === key).length;
        return stale > 0 ? `${stale} stale (5d+)` : 'all active';
      }
      case 'offer':
        return data.pipeline_counts.offer > 0 ? 'closing' : '—';
      case 'placed':
        return `${data.metrics.placements_mtd} this month`;
      default:
        return '';
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Pipeline Strip */}
      {loading ? (
        <PipelineSkeleton />
      ) : data ? (
        <div className="flex gap-[2px] rounded-lg overflow-hidden">
          {STAGES.map((stage, i) => (
            <button
              key={stage.key}
              onClick={() => router.push(`/candidates?status=${stage.key}`)}
              className="flex-1 bg-[var(--bg-surface-2)] p-4 relative cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)] text-left"
              style={{
                borderRadius: i === 0 ? '10px 0 0 10px' : i === STAGES.length - 1 ? '0 10px 10px 0' : '0',
              }}
            >
              <div
                className="text-[10px] uppercase tracking-[1.2px] font-semibold mb-1"
                style={{ color: stage.color }}
              >
                {stage.label}
              </div>
              <div className="text-[28px] font-[800] text-[var(--text-primary)] tracking-tight">
                {data.pipeline_counts[stage.key] || 0}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {stageMeta(stage.key)}
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px]"
                style={{ background: stage.color }}
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* Two-Column: Needs Attention + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Needs Attention */}
        {loading ? (
          <PanelSkeleton />
        ) : (
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-[18px]">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.8px] text-[var(--text-secondary)]">
                Needs Attention
              </h2>
              {attentionItems.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--error-dim)] text-[var(--error)]">
                  {attentionItems.length}
                </span>
              )}
            </div>
            {attentionItems.length === 0 ? (
              <div className="flex items-center gap-2 py-6 justify-center text-[var(--success)]">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">All clear — no candidates need attention right now.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {attentionItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/candidates?highlight=${item.profileId}`)}
                    className="w-full text-left p-2.5 rounded-r-md bg-[var(--bg-surface-2)] transition-colors hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                    style={{ borderLeft: `3px solid ${severityColor[item.severity]}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                          {item.detail}
                        </div>
                      </div>
                      <span
                        className="text-[9px] font-bold tracking-wide whitespace-nowrap mt-0.5"
                        style={{ color: severityTextColor[item.severity] }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Feed */}
        {loading ? (
          <PanelSkeleton />
        ) : (
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-[18px]">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.8px] text-[var(--text-secondary)]">
                Activity Feed
              </h2>
              <span className="text-[10px] text-[var(--text-muted)]">Last 48h</span>
            </div>
            {data && data.recent_activity.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                No recent activity in the last 48 hours.
              </div>
            ) : data ? (
              <div className="border-l-2 border-[var(--border-subtle)] pl-4 space-y-3">
                {data.recent_activity.slice(0, 8).map((entry, i) => {
                  const { main, sub } = activityText(entry);
                  return (
                    <div key={entry.id || i} className="relative">
                      <div
                        className="absolute -left-[21px] top-[3px] w-2 h-2 rounded-full"
                        style={{ background: activityDotColor(entry) }}
                      />
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {relativeTime(entry.created_at)}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">{main}</div>
                      {sub && (
                        <div className="text-[11px] text-[var(--text-muted)]">{sub}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Velocity Metrics */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-3.5 animate-pulse">
              <div className="h-2 w-16 bg-[var(--bg-surface-3)] rounded mb-2 mx-auto" />
              <div className="h-6 w-10 bg-[var(--bg-surface-3)] rounded mx-auto" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-3.5 text-center">
            <div className="text-[9px] uppercase tracking-[1.2px] text-[var(--text-muted)] font-semibold">
              Avg Days in Stage
            </div>
            <div className="text-[24px] font-[800] text-[var(--text-primary)] mt-1 tracking-tight">
              {data.metrics.avg_days_in_stage}
            </div>
          </div>
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-3.5 text-center">
            <div className="text-[9px] uppercase tracking-[1.2px] text-[var(--text-muted)] font-semibold">
              Submit → Interview
            </div>
            <div className="text-[24px] font-[800] text-[var(--text-primary)] mt-1 tracking-tight">
              {data.metrics.submission_interview_rate}%
            </div>
          </div>
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-3.5 text-center">
            <div className="text-[9px] uppercase tracking-[1.2px] text-[var(--text-muted)] font-semibold">
              Placements MTD
            </div>
            <div className="text-[24px] font-[800] text-[var(--text-primary)] mt-1 tracking-tight">
              {data.metrics.placements_mtd}
            </div>
          </div>
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-3.5 text-center">
            <div className="text-[9px] uppercase tracking-[1.2px] text-[var(--text-muted)] font-semibold">
              Active Submissions
            </div>
            <div className="text-[24px] font-[800] text-[var(--text-primary)] mt-1 tracking-tight">
              {data.metrics.active_submissions_count}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              across {data.metrics.active_submissions_companies} {data.metrics.active_submissions_companies === 1 ? 'company' : 'companies'}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
