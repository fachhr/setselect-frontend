'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, RefreshCw, Copy, Check, Building2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { InviteCompanyDialog } from '@/components/InviteCompanyDialog';
import { formatEntryDate } from '@/lib/helpers';
import type { CompanyAccount } from '@/types/recruiter';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Regenerate link state per company
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [regeneratedLink, setRegeneratedLink] = useState<{ id: string; link: string } | null>(null);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchCompanies = useCallback(async () => {
    setFetchError(null);
    setRegenerateError(null);
    setRegeneratedLink(null);
    try {
      const res = await fetch('/api/companies');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError(data.error || `Failed to load companies (${res.status})`);
        return;
      }
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch {
      setFetchError('Connection error — could not load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Cleanup copy timer on unmount
  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const handleRegenerate = async (company: CompanyAccount) => {
    setRegeneratingId(company.id);
    setRegeneratedLink(null);
    setRegenerateError(null);

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
      if (!res.ok) {
        setRegenerateError(data.error || 'Failed to regenerate link');
        return;
      }
      if (data.actionLink) {
        setRegeneratedLink({ id: company.id, link: data.actionLink });
      }
    } catch {
      setRegenerateError('Connection error');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleCopyLink = async (companyId: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(companyId);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: select the input text for manual copy
    }
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

      {/* Fetch error */}
      {fetchError && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
          <AlertCircle size={16} className="text-[var(--error)] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-[var(--error)]">{fetchError}</p>
            <button
              onClick={fetchCompanies}
              className="text-xs text-[var(--error)] underline mt-1 cursor-pointer hover:opacity-80"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Regenerate error */}
      {regenerateError && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
          <AlertCircle size={16} className="text-[var(--error)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--error)]">{regenerateError}</p>
        </div>
      )}

      {!fetchError && companies.length === 0 ? (
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
      ) : companies.length > 0 ? (
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
      ) : null}

      {/* Invite dialog */}
      <InviteCompanyDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
