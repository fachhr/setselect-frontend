'use client';

import { Copy, FileText, Edit2, Mail, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatTalentId, formatEntryDate, formatCantons } from '@/lib/helpers';
import { toast } from '@/components/ui/Toast';
import type { RecruiterCandidateView } from '@/types/recruiter';

interface CandidateTableProps {
  candidates: RecruiterCandidateView[];
  onSelect: (candidate: RecruiterCandidateView) => void;
  onDownloadCv: (profileId: string) => void;
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast('success', `${label} copied`);
}

export function CandidateTable({ candidates, onSelect, onDownloadCv, page, totalPages, total, onPageChange }: CandidateTableProps) {
  if (candidates.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-12 text-center">
        <p className="text-[var(--text-muted)]">No candidates found</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-strong)] bg-[var(--bg-surface-2)]">
              <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Ref ID
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Name & Role
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider hidden md:table-cell">
                Contact
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider hidden lg:table-cell">
                Location
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider hidden lg:table-cell">
                Owner
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider hidden sm:table-cell">
                Added
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {candidates.map((c) => (
              <tr
                key={c.profile_id}
                className="group hover:bg-[var(--bg-surface-2)] transition-all duration-200 cursor-pointer"
                onClick={() => onSelect(c)}
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-medium bg-[var(--bg-surface-2)] px-2 py-1 rounded text-[var(--text-accent)]">
                    {formatTalentId(c.talent_id)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {c.contact_first_name} {c.contact_last_name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {c.desired_roles || 'No role specified'}
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="space-y-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(c.email, 'Email');
                      }}
                      className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors cursor-pointer"
                    >
                      <Mail size={12} className="text-[var(--text-muted)]" />
                      <span className="text-xs truncate max-w-[180px]">{c.email}</span>
                      <Copy size={10} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--bg-surface-3)] rounded" />
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
                        <span className="text-xs">
                          {c.country_code} {c.phoneNumber}
                        </span>
                        <Copy size={10} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--bg-surface-3)] rounded" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {formatCantons(c.desired_locations)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {c.owner || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatEntryDate(c.profile_created_at, true)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {c.cv_storage_path && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadCv(c.profile_id);
                        }}
                        className="p-2 hover:bg-[var(--bg-surface-2)] rounded-lg text-[var(--text-tertiary)] hover:text-[var(--secondary)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-[var(--border-subtle)]"
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
                      className="p-2 hover:bg-[var(--bg-surface-2)] rounded-lg text-[var(--text-tertiary)] hover:text-[var(--secondary)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-[var(--border-subtle)]"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total !== undefined && (
        <div className="border-t border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Showing {candidates.length} of {total} candidates
          </span>
          {totalPages !== undefined && totalPages > 1 && onPageChange && (
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(page! - 1)}
                disabled={!page || page <= 1}
                className="px-3 py-1 border border-[var(--border-strong)] rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(page! + 1)}
                disabled={!page || page >= totalPages}
                className="px-3 py-1 border border-[var(--border-strong)] rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
