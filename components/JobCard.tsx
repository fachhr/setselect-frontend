'use client';

import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { JobListing, JobListingStatus, JobSeniority } from '@/types/recruiter';
import { Badge } from '@/components/ui/Badge';

type BadgeVariant = 'default' | 'blue' | 'purple' | 'gold' | 'success' | 'warning' | 'error' | 'muted';

const JOB_STATUS_BADGE: Record<JobListingStatus, BadgeVariant> = {
  new: 'blue',
  evaluating: 'purple',
  pursuing: 'gold',
  passed: 'muted',
};

const SENIORITY_BADGE: Record<JobSeniority, BadgeVariant> = {
  junior: 'muted',
  mid: 'default',
  senior: 'blue',
  executive: 'purple',
  'c-suite': 'gold',
};

interface JobCardProps {
  listing: JobListing;
  onStatusChange: (id: string, status: JobListingStatus) => void;
}

function urgencyLabel(firstSeenAt: string): { text: string; detail: string; className: string } {
  const date = new Date(firstSeenAt);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  const shortDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  if (days === 0) return { text: 'JUST POSTED', detail: 'today', className: 'text-[var(--success)]' };
  if (days === 1) return { text: 'JUST POSTED', detail: 'yesterday', className: 'text-[var(--success)]' };
  if (days === 2) return { text: 'JUST POSTED', detail: '2d ago', className: 'text-[var(--success)]' };
  if (days < 14) return { text: `${days}d ago`, detail: shortDate, className: 'text-[var(--text-muted)]' };
  const weeks = Math.floor(days / 7);
  return { text: `${weeks}w+`, detail: shortDate, className: 'text-[var(--text-muted)] opacity-60' };
}

const STATUS_ACTIONS: { status: JobListingStatus; label: string }[] = [
  { status: 'evaluating', label: 'Evaluating' },
  { status: 'pursuing', label: 'Pursuing ★' },
  { status: 'passed', label: 'Pass' },
];

export function JobCard({ listing, onStatusChange }: JobCardProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const urgency = urgencyLabel(listing.date_posted || listing.first_seen_at);
  const isRemoved = !!listing.removed_at;

  const borderColor = listing.status === 'new'
    ? 'var(--primary)'
    : listing.status === 'pursuing'
      ? 'var(--badge-gold-text)'
      : 'var(--border-subtle)';

  return (
    <div
      className={`bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-4 transition-colors ${
        isRemoved ? 'opacity-50' : 'hover:bg-[var(--bg-surface-hover)]'
      }`}
      style={{ borderLeftWidth: '3px', borderLeftColor: borderColor }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <Badge variant={JOB_STATUS_BADGE[listing.status]} className="uppercase text-[10px]">
              {listing.status}
            </Badge>
            {listing.seniority && (
              <Badge variant={SENIORITY_BADGE[listing.seniority]} className="uppercase text-[10px]">
                {listing.seniority}
              </Badge>
            )}
            {isRemoved && (
              <Badge variant="error" className="text-[10px]">
                NO LONGER POSTED
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-sm font-medium text-[var(--text-primary)] ${isRemoved ? 'line-through' : ''}`}>
            {listing.title}
          </h3>

          {/* Meta line */}
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-tertiary)]">
            <span className="font-medium text-[var(--text-secondary)]">{listing.company_name}</span>
            {listing.location && (
              <>
                <span>·</span>
                <span>{listing.location}</span>
              </>
            )}
          </div>
        </div>

        {/* Urgency label */}
        <div className="text-right shrink-0 mt-1">
          <div className={`text-[10px] font-bold tracking-wide whitespace-nowrap ${urgency.className}`}>
            {urgency.text}
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
            {urgency.detail}
          </div>
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <div className="mt-2.5">
          <p className={`text-xs text-[var(--text-tertiary)] leading-relaxed ${
            descExpanded ? '' : 'line-clamp-3'
          }`}>
            {listing.description}
          </p>
          {listing.description.length > 200 && (
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              className="flex items-center gap-0.5 mt-1 text-[11px] text-[var(--text-accent)] hover:text-[var(--primary)] transition-colors cursor-pointer"
            >
              {descExpanded ? (
                <>less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>more <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {STATUS_ACTIONS.map((action) => (
          <button
            key={action.status}
            onClick={() => onStatusChange(listing.id, action.status)}
            disabled={listing.status === action.status}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
              listing.status === action.status
                ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)] font-medium border-[var(--border-strong)]'
                : 'text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:border-[var(--border-strong)]'
            }`}
          >
            {action.label}
          </button>
        ))}
        {listing.url.startsWith('http') && (
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[var(--text-accent)] hover:text-[var(--primary)] transition-colors ml-auto"
            aria-label={`Open ${listing.title} posting`}
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
