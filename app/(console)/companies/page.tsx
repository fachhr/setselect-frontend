'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, RefreshCw, Copy, Check, Building2, AlertCircle } from 'lucide-react';
import { InviteCompanyDialog } from '@/components/InviteCompanyDialog';
import { CompanyPipelineCard } from '@/components/CompanyPipelineCard';
import type { CompanyPipelineData } from '@/components/CompanyPipelineCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { formatEntryDate } from '@/lib/helpers';
import { useMarket } from '@/lib/MarketContext';
import type { CompanyAccount } from '@/types/recruiter';

export default function CompaniesPage() {
  const { market } = useMarket();
  const [companies, setCompanies] = useState<CompanyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [companyView, setCompanyView] = useState<'board' | 'table'>('board');
  const [pipelineData, setPipelineData] = useState<CompanyPipelineData[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);

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
      const res = await fetch(`/api/companies?market=${market}`);
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
  }, [market]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    setPipelineLoading(true);
    fetch(`/api/companies/pipeline?market=${market}`)
      .then(res => res.json())
      .then(data => setPipelineData(data.companies ?? []))
      .catch(() => {})
      .finally(() => setPipelineLoading(false));
  }, [market]);

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const handleRegenerate = async (company: CompanyAccount) => {
    if (regeneratingId) return;
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
      } else {
        setRegenerateError(data.warning || 'Link generated but could not be retrieved');
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
      // Clipboard API unavailable
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
    <div className="space-y-5 animate-in fade-in">
      <PageHeader
        title="Companies"
        actions={
          <>
            <SegmentedControl
              options={[
                { value: 'board', label: 'Submissions Pipeline' },
                { value: 'table', label: 'Portal Access' },
              ]}
              value={companyView}
              onChange={setCompanyView}
            />
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-surface-3)] transition-colors"
            >
              <Plus size={14} />
              {companyView === 'board' ? 'Add Company' : 'Invite Company'}
            </button>
          </>
        }
      />

      {companyView === 'board' && (
        <div className="space-y-3">
          {pipelineLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : pipelineData.length === 0 ? (
            <div className="glass-panel rounded-lg p-12 text-center">
              <p className="text-[var(--text-muted)]">No submissions yet. Submit candidates from the Talent Pool.</p>
            </div>
          ) : (
            pipelineData.map((company) => (
              <CompanyPipelineCard key={company.company_id} company={company} />
            ))
          )}
        </div>
      )}

      {companyView === 'table' && fetchError && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--error-dim)] border border-[var(--error-border)]">
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

      {companyView === 'table' && regenerateError && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--error-dim)] border border-[var(--error-border)]">
          <AlertCircle size={16} className="text-[var(--error)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--error)]">{regenerateError}</p>
        </div>
      )}

      {companyView === 'table' && !fetchError && companies.length === 0 ? (
        <div className="glass-panel rounded-lg p-12 text-center">
          <Building2 size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            No companies yet
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Invite your first company to get started.
          </p>
          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium rounded-md bg-[var(--primary)] border border-[var(--primary-hover)] text-white cursor-pointer hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Plus size={16} />
            Invite Company
          </button>
        </div>
      ) : companyView === 'table' && companies.length > 0 ? (
        <div className="glass-panel rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border-strong)] bg-[var(--bg-surface-2)]">
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1.2px]">
                    Company
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1.2px]">
                    Contact
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1.2px] hidden sm:table-cell">
                    Invited By
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1.2px] hidden md:table-cell">
                    Invited
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1.2px]">
                    Status
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1.2px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-[var(--border-strong)] hover:bg-[var(--bg-surface-2)] transition-colors duration-150"
                  >
                    <td className="px-3 py-2.5 text-xs font-medium text-[var(--text-primary)]">
                      {company.company_name}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-primary)]">
                      {company.contact_email}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-tertiary)] hidden sm:table-cell">
                      {company.invited_by || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-tertiary)] hidden md:table-cell">
                      {formatEntryDate(company.invited_at)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        company.last_sign_in_at
                          ? 'bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]'
                          : 'bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]'
                      }`}>
                        {company.last_sign_in_at ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {regeneratedLink?.id === company.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={regeneratedLink.link}
                            readOnly
                            className="w-[160px] px-2 py-1 text-[10px] font-mono bg-[var(--bg-surface-2)] border border-[var(--border-strong)] rounded text-[var(--text-secondary)] outline-none"
                          />
                          <button
                            onClick={() => handleCopyLink(company.id, regeneratedLink.link)}
                            className="p-1 rounded bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-surface-3)] transition-colors"
                            title="Copy link"
                          >
                            {copiedId === company.id ? (
                              <Check size={12} className="text-[var(--success)]" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegenerate(company)}
                          disabled={regeneratingId === company.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-[var(--text-primary)] cursor-pointer disabled:opacity-50 hover:bg-[var(--bg-surface-3)] transition-colors"
                          title="Regenerate magic link"
                        >
                          <RefreshCw
                            size={12}
                            className={regeneratingId === company.id ? 'animate-spin' : ''}
                          />
                          Regenerate Link
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <InviteCompanyDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
