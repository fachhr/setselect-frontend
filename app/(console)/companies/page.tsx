'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, RefreshCw, Copy, Check, Building2, AlertCircle } from 'lucide-react';
import { InviteCompanyDialog } from '@/components/InviteCompanyDialog';
import { CompanyPipelineCard } from '@/components/CompanyPipelineCard';
import type { CompanyPipelineData } from '@/components/CompanyPipelineCard';
import { formatEntryDate } from '@/lib/helpers';
import type { CompanyAccount } from '@/types/recruiter';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [companyView, setCompanyView] = useState<'board' | 'table'>('board');
  const [pipelineData, setPipelineData] = useState<CompanyPipelineData[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);

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

  // Fetch pipeline data
  useEffect(() => {
    setPipelineLoading(true);
    fetch('/api/companies/pipeline')
      .then(res => res.json())
      .then(data => setPipelineData(data.companies ?? []))
      .catch(() => {/* non-blocking */})
      .finally(() => setPipelineLoading(false));
  }, []);

  // Cleanup copy timer on unmount
  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const handleRegenerate = async (company: CompanyAccount) => {
    if (regeneratingId) return; // Prevent double-click
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
      // Clipboard API unavailable (e.g. insecure context); silently ignore
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
      {/* Header with view toggle and Invite button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-surface-2)', borderRadius: '6px', padding: '3px' }}>
          <button
            onClick={() => setCompanyView('board')}
            style={{
              padding: '5px 14px', fontSize: '11px', fontWeight: 500, borderRadius: '4px', cursor: 'pointer', border: 'none',
              background: companyView === 'board' ? 'var(--bg-surface-3)' : 'transparent',
              color: companyView === 'board' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            Submissions Pipeline
          </button>
          <button
            onClick={() => setCompanyView('table')}
            style={{
              padding: '5px 14px', fontSize: '11px', fontWeight: 500, borderRadius: '4px', cursor: 'pointer', border: 'none',
              background: companyView === 'table' ? 'var(--bg-surface-3)' : 'transparent',
              color: companyView === 'table' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            Portal Access
          </button>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          {companyView === 'board' ? 'Add Company' : 'Invite Company'}
        </button>
      </div>

      {/* Pipeline View */}
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

      {/* Portal Access View */}
      {companyView === 'table' && fetchError && (
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

      {/* Regenerate error (portal access view only) */}
      {companyView === 'table' && regenerateError && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
          <AlertCircle size={16} className="text-[var(--error)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--error)]">{regenerateError}</p>
        </div>
      )}

      {companyView === 'table' && !fetchError && companies.length === 0 ? (
        /* Empty state */
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
            style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', background: 'var(--primary)', border: '1px solid var(--primary-hover)', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            Invite Company
          </button>
        </div>
      ) : companyView === 'table' && companies.length > 0 ? (
        /* Company table */
        <div className="glass-panel rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border-strong)] bg-[var(--bg-surface-2)]">
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1px]">
                    Company
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1px]">
                    Contact
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1px] hidden sm:table-cell">
                    Invited By
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1px] hidden md:table-cell">
                    Invited
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1px]">
                    Status
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[1px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    style={{ borderBottom: '1px solid var(--border-strong)' }}
                    className="hover:bg-[var(--bg-surface-2)] transition-colors duration-150"
                  >
                    <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {company.company_name}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-primary)' }}>
                      {company.contact_email}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-tertiary)' }} className="hidden sm:table-cell">
                      {company.invited_by || '—'}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-tertiary)' }} className="hidden md:table-cell">
                      {formatEntryDate(company.invited_at)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: company.last_sign_in_at ? '#064e3b' : '#3d1f0a',
                        color: company.last_sign_in_at ? '#6ee7b7' : '#fdba74',
                      }}>
                        {company.last_sign_in_at ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {regeneratedLink?.id === company.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="text"
                            value={regeneratedLink.link}
                            readOnly
                            style={{ width: '160px', padding: '4px 8px', fontSize: '10px', fontFamily: 'monospace', background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)', borderRadius: '4px', color: 'var(--text-secondary)', outline: 'none' }}
                          />
                          <button
                            onClick={() => handleCopyLink(company.id, regeneratedLink.link)}
                            style={{ padding: '4px 6px', borderRadius: '4px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer' }}
                            title="Copy link"
                          >
                            {copiedId === company.id ? (
                              <Check size={12} style={{ color: 'var(--success)' }} />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegenerate(company)}
                          disabled={regeneratingId === company.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '11px', borderRadius: '6px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', opacity: regeneratingId === company.id ? 0.5 : 1 }}
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

      {/* Invite dialog */}
      <InviteCompanyDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
