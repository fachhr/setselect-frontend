'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, Copy, Check, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { InviteCompanyDialog } from '@/components/InviteCompanyDialog';
import { formatEntryDate } from '@/lib/helpers';
import type { CompanyAccount } from '@/types/recruiter';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Regenerate link state per company
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [regeneratedLink, setRegeneratedLink] = useState<{ id: string; link: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data.companies || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleRegenerate = async (company: CompanyAccount) => {
    setRegeneratingId(company.id);
    setRegeneratedLink(null);

    try {
      const res = await fetch('/api/companies/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: company.contact_email,
          companyName: company.company_name,
          regenerateLink: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.actionLink) {
        setRegeneratedLink({ id: company.id, link: data.actionLink });
      }
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleCopyLink = async (companyId: string, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(companyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header with Invite button */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setInviteOpen(true)}
          className="btn-gold px-4 py-2.5 rounded-lg text-sm shadow-lg cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} />
          Invite Company
        </button>
      </div>

      {companies.length === 0 ? (
        /* Empty state */
        <div className="glass-panel rounded-xl p-12 text-center">
          <Building2 size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            No companies yet
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Invite your first company to get started.
          </p>
          <button
            onClick={() => setInviteOpen(true)}
            className="btn-gold px-6 py-3 rounded-lg text-sm shadow-lg cursor-pointer inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Invite Company
          </button>
        </div>
      ) : (
        /* Company table */
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-strong)] bg-[var(--bg-surface-2)]">
                  <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider hidden sm:table-cell">
                    Invited By
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider hidden md:table-cell">
                    Invited
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-[var(--bg-surface-2)] transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <span className="text-[var(--text-primary)] font-bold">
                        {company.company_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[var(--text-secondary)] text-xs">
                        {company.contact_email}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-[var(--text-muted)] text-xs">
                        {company.invited_by || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-[var(--text-muted)] text-xs">
                        {formatEntryDate(company.invited_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {company.last_sign_in_at ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {regeneratedLink?.id === company.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={regeneratedLink.link}
                              readOnly
                              className="input-base w-40 px-2 py-1.5 rounded text-xs font-mono text-[var(--text-tertiary)]"
                            />
                            <button
                              onClick={() => handleCopyLink(company.id, regeneratedLink.link)}
                              className="shrink-0 p-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--secondary)] text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-all cursor-pointer"
                              title="Copy link"
                            >
                              {copiedId === company.id ? (
                                <Check size={14} className="text-[var(--success)]" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegenerate(company)}
                            disabled={regeneratingId === company.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--secondary)] text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-all cursor-pointer disabled:opacity-50"
                            title="Regenerate magic link"
                          >
                            <RefreshCw
                              size={13}
                              className={regeneratingId === company.id ? 'animate-spin' : ''}
                            />
                            Regenerate Link
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite dialog */}
      <InviteCompanyDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
