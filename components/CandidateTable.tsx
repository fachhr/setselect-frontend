'use client';

import { Copy, FileText, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatTalentId, formatEntryDate, formatCantons } from '@/lib/helpers';
import { toast } from '@/components/ui/Toast';
import type { RecruiterCandidateView } from '@/types/recruiter';

interface CandidateTableProps {
  candidates: RecruiterCandidateView[];
  onSelect: (candidate: RecruiterCandidateView) => void;
  onDownloadCv: (profileId: string) => void;
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast('success', `${label} copied`);
}

export function CandidateTable({ candidates, onSelect, onDownloadCv }: CandidateTableProps) {
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
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-0)]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Ref ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Name & Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">
                Contact
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">
                Location
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">
                Owner
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">
                Added
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {candidates.map((c) => (
              <tr
                key={c.profile_id}
                className="hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
                onClick={() => onSelect(c)}
              >
                <td className="px-4 py-3">
                  <span className="text-[var(--text-accent)] font-mono text-xs">
                    {formatTalentId(c.talent_id)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--text-primary)]">
                    {c.contact_first_name} {c.contact_last_name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {c.desired_roles || 'No role specified'}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="space-y-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(c.email, 'Email');
                      }}
                      className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors cursor-pointer group"
                    >
                      <span className="text-xs truncate max-w-[180px]">{c.email}</span>
                      <Copy size={10} className="opacity-0 group-hover:opacity-100" />
                    </button>
                    {c.phoneNumber && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(`${c.country_code}${c.phoneNumber}`, 'Phone');
                        }}
                        className="flex items-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--secondary)] transition-colors cursor-pointer group"
                      >
                        <span className="text-xs">
                          {c.country_code} {c.phoneNumber}
                        </span>
                        <Copy size={10} className="opacity-0 group-hover:opacity-100" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {formatCantons(c.desired_locations)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {c.owner || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatEntryDate(c.profile_created_at, true)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {c.cv_storage_path && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadCv(c.profile_id);
                        }}
                        className="p-1.5 rounded-md hover:bg-[var(--bg-surface-3)] text-[var(--text-tertiary)] hover:text-[var(--secondary)] transition-colors cursor-pointer"
                        title="Download CV"
                      >
                        <FileText size={15} />
                      </button>
                    )}
                    <ChevronRight
                      size={15}
                      className="text-[var(--text-muted)]"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
