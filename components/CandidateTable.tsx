'use client';

import { Copy, FileText, Edit2, Mail, Phone, ArrowUp, ArrowDown, Send } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import { FavoriteButton } from '@/components/FavoriteButton';
import { formatTalentId, formatCantons } from '@/lib/helpers';
import { STATUS_OPTIONS, EXPERIENCE_OPTIONS, STATUS_PILL_COLORS } from '@/lib/constants';
import { toast } from '@/components/ui/Toast';
import type { RecruiterCandidateView, RecruiterStatus, CandidateSubmission } from '@/types/recruiter';

const STALE_AMBER_DAYS = 5;
const STALE_RED_DAYS = 7;
const TERMINAL_STATUSES: RecruiterStatus[] = ['placed', 'rejected'];

const STATUS_PILL_CONFIG = STATUS_PILL_COLORS;

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function relativeActivityTime(dateStr: string | undefined): { text: string; colorClass: string } {
  if (!dateStr) return { text: '—', colorClass: 'text-[var(--text-muted)]' };
  const days = daysSince(dateStr);
  if (days === 0) return { text: 'Today', colorClass: 'text-[var(--success)]' };
  if (days === 1) return { text: 'Yesterday', colorClass: 'text-[var(--success)]' };
  if (days <= 5) return { text: `${days}d ago`, colorClass: 'text-[var(--text-tertiary)]' };
  return { text: `${days}d ago`, colorClass: 'text-[var(--error)] font-medium' };
}

export interface TableFilters {
  talent_id: string;
  name: string;
  contact: string;
  location: string[];
  experience: string[];
  status: string[];
  owner: string;
  added: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface CandidateTableProps {
  candidates: RecruiterCandidateView[];
  onSelect: (candidate: RecruiterCandidateView) => void;
  onDownloadCv: (profileId: string) => void;
  onToggleFavorite: (profileId: string) => void;
  onStatusChange?: (profileId: string, status: RecruiterStatus) => void;
  allSubmissions?: CandidateSubmission[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  filters: TableFilters;
  onFilterChange: (key: keyof TableFilters, value: string | string[]) => void;
  page: number;
  totalPages: number;
  total: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
  locationOptions: { value: string; label: string }[];
  favoritesOnly: boolean;
  onToggleFavoritesFilter: () => void;
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast('success', `${label} copied`);
}

interface SortIconProps {
  columnKey: string;
  sortConfig: SortConfig | null;
}

function SortIcon({ columnKey, sortConfig }: SortIconProps) {
  const isActive = sortConfig?.key === columnKey;
  if (isActive) {
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={12} className="text-[var(--secondary)]" />
      : <ArrowDown size={12} className="text-[var(--secondary)]" />;
  }
  return <ArrowUp size={12} className="opacity-0 group-hover/th:opacity-30 transition-opacity" />;
}

interface ColumnDef {
  key: string;
  label: string;
  sortable: boolean;
  filterType: 'text' | 'multi-select' | 'none';
  filterKey?: keyof TableFilters;
  responsive: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'talent_id', label: 'Ref ID', sortable: true, filterType: 'text', filterKey: 'talent_id', responsive: 'hidden sm:table-cell' },
  { key: 'name', label: 'Name & Role', sortable: true, filterType: 'text', filterKey: 'name', responsive: '' },
  { key: 'contact', label: 'Contact', sortable: false, filterType: 'text', filterKey: 'contact', responsive: 'hidden md:table-cell' },
  { key: 'location', label: 'Location', sortable: true, filterType: 'multi-select', filterKey: 'location', responsive: 'hidden lg:table-cell' },
  { key: 'experience', label: 'Experience', sortable: true, filterType: 'multi-select', filterKey: 'experience', responsive: 'hidden lg:table-cell' },
  { key: 'submissions', label: 'Submissions', sortable: false, filterType: 'none', responsive: 'hidden lg:table-cell' },
  { key: 'status', label: 'Status', sortable: true, filterType: 'multi-select', filterKey: 'status', responsive: '' },
  { key: 'owner', label: 'Owner', sortable: true, filterType: 'text', filterKey: 'owner', responsive: 'hidden lg:table-cell' },
  { key: 'last_activity', label: 'Last Activity', sortable: true, filterType: 'none', responsive: 'hidden sm:table-cell' },
  { key: 'actions', label: 'Actions', sortable: false, filterType: 'none', responsive: '' },
];

function getMultiSelectOptions(col: ColumnDef, locationOptions: { value: string; label: string }[]) {
  switch (col.filterKey) {
    case 'location': return locationOptions;
    case 'experience': return [...EXPERIENCE_OPTIONS];
    case 'status': return [...STATUS_OPTIONS];
    default: return [];
  }
}

export function CandidateTable({
  candidates,
  onSelect,
  onDownloadCv,
  onToggleFavorite,
  onStatusChange,
  allSubmissions = [],
  sortConfig,
  onSort,
  filters,
  onFilterChange,
  page,
  totalPages,
  total,
  filteredCount,
  onPageChange,
  locationOptions,
  // favoritesOnly and onToggleFavoritesFilter are passed for interface compat but unused in table body
}: CandidateTableProps) {
  if (candidates.length === 0 && filteredCount === 0 && total === 0) {
    return (
      <div className="glass-panel rounded-lg p-12 text-center">
        <p className="text-[var(--text-muted)]">No candidates found</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {/* Column headers */}
            <tr className="border-b border-[var(--border-strong)] bg-[var(--bg-surface-2)]">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1px] ${col.responsive} ${
                    col.sortable ? 'cursor-pointer select-none group/th hover:text-[var(--text-secondary)] transition-colors' : ''
                  }`}
                  onClick={col.sortable ? () => onSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} sortConfig={sortConfig} />}
                  </span>
                </th>
              ))}
            </tr>

            {/* Filter row */}
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]">
              {COLUMNS.map((col) => (
                <th key={col.key} className={`px-4 py-2 sm:px-6 ${col.responsive}`}>
                  {col.filterType === 'text' && col.filterKey ? (
                    <input
                      type="text"
                      placeholder={col.label}
                      value={(filters[col.filterKey] as string) || ''}
                      onChange={(e) => onFilterChange(col.filterKey!, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="filter-input w-full px-2 py-1 rounded text-xs h-7 font-normal"
                    />
                  ) : col.filterType === 'multi-select' && col.filterKey ? (
                    <MultiSelectFilter
                      options={getMultiSelectOptions(col, locationOptions)}
                      selected={(filters[col.filterKey] as string[]) || []}
                      onChange={(values) => onFilterChange(col.filterKey!, values)}
                      placeholder={col.label}
                    />
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-subtle)]">
            {candidates.map((c) => {
              const activityDate = c.last_activity_at || c.status_changed_at;
              const daysStale = daysSince(activityDate);
              const isStale = daysStale >= STALE_AMBER_DAYS && !TERMINAL_STATUSES.includes(c.status);
              const isStaleRed = daysStale >= STALE_RED_DAYS && !TERMINAL_STATUSES.includes(c.status);

              return (
              <tr
                key={c.profile_id}
                className={`group hover:bg-[var(--bg-surface-2)] transition-all duration-150 cursor-pointer ${
                  isStaleRed ? 'bg-[var(--error-dim)] hover:bg-[rgba(239,68,68,0.08)]' : ''
                }`}
                onClick={() => onSelect(c)}
              >
                {/* Ref ID */}
                <td className="px-3 py-2.5 whitespace-nowrap hidden sm:table-cell">
                  <span className="font-mono text-xs font-medium bg-[var(--bg-surface-2)] px-2 py-1 rounded text-[var(--text-accent)]">
                    {formatTalentId(c.talent_id)}
                  </span>
                </td>

                {/* Name & Role */}
                <td className="px-3 py-2.5">
                  <div className="text-xs font-medium text-[var(--text-primary)]">
                    {isStale && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                        style={{ background: isStaleRed ? 'var(--error)' : 'var(--status-follow-up)' }}
                      />
                    )}
                    {c.contact_first_name} {c.contact_last_name}
                  </div>
                  {c.desired_roles && (
                    <div className="text-xs text-[var(--text-secondary)]">{c.desired_roles}</div>
                  )}
                  <span className="font-mono text-[10px] text-[var(--text-muted)] sm:hidden">
                    {formatTalentId(c.talent_id)}
                  </span>
                </td>

                {/* Contact */}
                <td className="px-3 py-2.5 hidden md:table-cell">
                  <div className="space-y-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(c.email, 'Email');
                      }}
                      className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors cursor-pointer"
                    >
                      <Mail size={12} className="text-[var(--text-muted)]" />
                      <span className="text-xs truncate max-w-[160px]">{c.email}</span>
                      <Copy size={10} className="opacity-0 group-hover:opacity-100" />
                    </button>
                    {c.phoneNumber && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(`${c.country_code}${c.phoneNumber}`, 'Phone');
                        }}
                        className="flex items-center gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--secondary)] transition-colors cursor-pointer"
                      >
                        <Phone size={12} className="text-[var(--text-muted)]" />
                        <span className="text-xs">{c.country_code} {c.phoneNumber}</span>
                        <Copy size={10} className="opacity-0 group-hover:opacity-100" />
                      </button>
                    )}
                  </div>
                </td>

                {/* Location */}
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {formatCantons(c.desired_locations)}
                  </span>
                </td>

                {/* Experience */}
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {c.years_of_experience != null ? `${c.years_of_experience} yrs` : '—'}
                  </span>
                </td>

                {/* Submissions */}
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  {(() => {
                    const subs = allSubmissions.filter(s => s.profile_id === c.profile_id);
                    if (subs.length === 0) return <span className="text-[var(--text-muted)] text-[11px]">—</span>;
                    return (
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        {subs.map(s => (
                          <span
                            key={s.id}
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ background: s.status === 'submitted' ? 'var(--status-new)' : s.status === 'interviewing' ? 'var(--status-interviewing)' : s.status === 'placed' ? 'var(--status-placed)' : 'var(--text-muted)' }}
                            title={`${s.company_name} — ${s.status}`}
                          />
                        ))}
                        <span className="text-[var(--text-tertiary)] ml-0.5">{subs.length}</span>
                      </span>
                    );
                  })()}
                </td>

                {/* Status */}
                <td className="px-3 py-2.5">
                  {onStatusChange ? (
                    <select
                      value={c.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(c.profile_id, e.target.value as RecruiterStatus);
                      }}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full border-none cursor-pointer"
                      style={{
                        background: STATUS_PILL_CONFIG[c.status].bg,
                        color: STATUS_PILL_CONFIG[c.status].text,
                      }}
                    >
                      {(['new', 'screening', 'interviewing', 'offer', 'placed', 'rejected'] as RecruiterStatus[]).map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={c.status} />
                  )}
                </td>

                {/* Owner */}
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {c.owner || '—'}
                  </span>
                </td>

                {/* Last Activity */}
                <td className="px-3 py-2.5 hidden sm:table-cell">
                  {(() => {
                    const activity = relativeActivityTime(c.last_activity_at || c.status_changed_at);
                    return (
                      <span className={`text-xs ${activity.colorClass}`}>
                        {activity.text}
                      </span>
                    );
                  })()}
                </td>

                {/* Actions */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <FavoriteButton
                      isFavorite={c.is_favorite}
                      onToggle={() => onToggleFavorite(c.profile_id)}
                    />
                    {c.cv_storage_path && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadCv(c.profile_id);
                        }}
                        className="p-1.5 sm:p-2 hover:bg-[var(--bg-surface-2)] rounded-lg text-[var(--text-tertiary)] hover:text-[var(--secondary)] transition-all duration-150 cursor-pointer border border-[var(--border-subtle)]"
                        title="Download CV"
                      >
                        <FileText size={15} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(c);
                      }}
                      className="p-1.5 sm:p-2 hover:bg-[var(--bg-surface-2)] rounded-lg text-[var(--text-tertiary)] hover:text-[var(--secondary)] transition-all duration-150 cursor-pointer border border-[var(--border-subtle)]"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(c);
                      }}
                      className="p-1.5 sm:p-2 hover:bg-[var(--bg-surface-2)] rounded-lg text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-all duration-150 cursor-pointer border border-[var(--border-subtle)] opacity-0 group-hover:opacity-100"
                      title="Submit to company"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border-strong)] bg-[var(--bg-surface-2)] px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">
            Showing {filteredCount} of {total} candidates
          </span>
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 border border-[var(--border-strong)] rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-2 py-1 text-xs text-[var(--text-muted)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-[var(--border-strong)] rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
