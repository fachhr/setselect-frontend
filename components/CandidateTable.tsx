'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, FileText, Mail, Phone, ArrowUp, ArrowDown, Send, Plus, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import { FavoriteButton } from '@/components/FavoriteButton';
import { formatTalentId, formatCantons } from '@/lib/helpers';
import { STATUS_OPTIONS, EXPERIENCE_OPTIONS, STATUS_PILL_COLORS } from '@/lib/constants';
import { toast } from '@/components/ui/Toast';
import type { RecruiterCandidateView, RecruiterStatus, CandidateSubmission, SubmissionCompany } from '@/types/recruiter';

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
  return { text: `${days}d ago`, colorClass: 'text-[var(--stale)] font-medium' };
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
  companies: SubmissionCompany[];
  onCreateSubmission: (profileId: string, companyId: string, submittedBy: string, notes: string) => Promise<void>;
  onCompanyAdded?: (company: SubmissionCompany) => void;
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

/* ── Quick Submit Button (popover for submitting candidate to company) ── */

interface QuickSubmitButtonProps {
  candidate: RecruiterCandidateView;
  companies: SubmissionCompany[];
  submissions: CandidateSubmission[];
  onCreateSubmission: (profileId: string, companyId: string, submittedBy: string, notes: string) => Promise<void>;
  onCompanyAdded?: (company: SubmissionCompany) => void;
}

function QuickSubmitButton({ candidate, companies, submissions, onCreateSubmission, onCompanyAdded }: QuickSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [addingCompany, setAddingCompany] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const submittedCompanyIds = new Set(submissions.map((s) => s.company_id));
  const availableCompanies = companies.filter((c) => !submittedCompanyIds.has(c.id));

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSubmittedBy(candidate.owner || '');
    setSelectedCompanyId('');
    setNotes('');
    setNewCompanyName('');
    setOpen(true);
  };

  const handleAddCompany = async () => {
    const name = newCompanyName.trim();
    if (!name) return;
    setAddingCompany(true);
    try {
      const res = await fetch('/api/submission-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast('error', data.error || 'Failed to add company');
        return;
      }
      const { company } = await res.json();
      onCompanyAdded?.(company);
      setSelectedCompanyId(company.id);
      setNewCompanyName('');
      toast('success', `Added ${company.name}`);
    } catch {
      toast('error', 'Failed to add company');
    } finally {
      setAddingCompany(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setSubmitting(true);
    try {
      await onCreateSubmission(candidate.profile_id, selectedCompanyId, submittedBy.trim(), notes.trim());
      setOpen(false);
      const companyName = companies.find((c) => c.id === selectedCompanyId)?.name || 'company';
      toast('success', `Submitted ${candidate.contact_first_name} to ${companyName}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={handleOpen}
        className="p-1.5 sm:p-2 hover:bg-[var(--bg-surface-2)] rounded-lg text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-all duration-150 cursor-pointer border border-[var(--border-subtle)]"
        title="Submit to company"
      >
        <Send size={15} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface-1)] shadow-lg"
        >
          <form onSubmit={handleSubmit} className="p-3 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1">
              Submit {candidate.contact_first_name} to company
            </div>

            {/* Company select */}
            <div>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="input-base w-full px-2.5 py-1.5 rounded-md text-xs cursor-pointer"
                required
              >
                <option value="">Select company...</option>
                {availableCompanies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 mt-1.5">
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCompany(); } }}
                  placeholder="Or add new..."
                  className="input-base flex-1 px-2.5 py-1.5 rounded-md text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCompany}
                  disabled={!newCompanyName.trim() || addingCompany}
                  className="disabled:opacity-40 text-[10px] px-2 py-1 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] cursor-pointer"
                >
                  <Plus size={11} className="inline mr-0.5" />{addingCompany ? '...' : 'Add'}
                </button>
              </div>
            </div>

            {/* Submitted by */}
            <div>
              <label className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-1">Submitted by</label>
              <input
                type="text"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="Recruiter name..."
                className="input-base w-full px-2.5 py-1.5 rounded-md text-xs"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-1">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. VP Finance role"
                className="input-base w-full px-2.5 py-1.5 rounded-md text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={!selectedCompanyId || submitting}
                className="disabled:opacity-50 flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-md cursor-pointer"
                style={{ background: 'var(--primary)', border: '1px solid var(--primary-hover)', color: 'var(--text-primary)' }}
              >
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[11px] px-2 py-1.5 text-[var(--text-secondary)] cursor-pointer bg-transparent border-none"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
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
  companies,
  onCreateSubmission,
  onCompanyAdded,
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
                <th key={col.key} className={`px-3 py-2 ${col.responsive}`}>
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
                  ''
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
                        style={{ background: 'var(--stale)' }}
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
                      className="text-[10px] font-semibold pl-2.5 pr-5 py-1 rounded-full border-none cursor-pointer appearance-none bg-no-repeat"
                      style={{
                        background: STATUS_PILL_CONFIG[c.status].bg,
                        color: STATUS_PILL_CONFIG[c.status].text,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(STATUS_PILL_CONFIG[c.status].text)}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 6px center',
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
                    <QuickSubmitButton
                      candidate={c}
                      companies={companies}
                      submissions={allSubmissions.filter((s) => s.profile_id === c.profile_id)}
                      onCreateSubmission={onCreateSubmission}
                      onCompanyAdded={onCompanyAdded}
                    />
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
