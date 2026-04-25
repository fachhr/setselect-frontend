'use client';

import { useState } from 'react';
import { Trash2, Play, Pause, TestTube, AlertTriangle, Loader2, X, Plus } from 'lucide-react';
import type { JobSource } from '@/types/recruiter';
import { TARGET_COUNTRY_OPTIONS, DEFAULT_TARGET_COUNTRIES } from '@/lib/constants';
import { toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface JobSourcesTableProps {
  sources: JobSource[];
  onSourceAdded: (source: JobSource) => void;
  onSourceUpdated: (source: JobSource) => void;
  onSourceDeleted: (id: string) => void;
}

export function JobSourcesTable({
  sources,
  onSourceAdded,
  onSourceUpdated,
  onSourceDeleted,
}: JobSourcesTableProps) {
  const [companyName, setCompanyName] = useState('');
  const [careerUrl, setCareerUrl] = useState('');
  const [newCountries, setNewCountries] = useState<string[]>([...DEFAULT_TARGET_COUNTRIES]);
  const [adding, setAdding] = useState(false);
  const [testingSources, setTestingSources] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<JobSource | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingCountries, setEditingCountries] = useState<string | null>(null);

  async function handleAdd() {
    if (!companyName.trim() || !careerUrl.trim()) return;

    setAdding(true);
    try {
      const res = await fetch('/api/job-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName.trim(),
          career_url: careerUrl.trim(),
          target_countries: newCountries,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast('error', data.error || 'Failed to add source');
        return;
      }
      onSourceAdded(data.source);
      setCompanyName('');
      setCareerUrl('');
      setNewCountries([...DEFAULT_TARGET_COUNTRIES]);
      toast('success', `Added ${data.source.company_name}`);
    } catch {
      toast('error', 'Failed to add source');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(source: JobSource) {
    try {
      const res = await fetch(`/api/job-sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !source.is_active }),
      });
      const data = await res.json();
      if (res.ok) {
        onSourceUpdated(data.source);
        toast('info', `${source.company_name} ${data.source.is_active ? 'activated' : 'paused'}`);
      }
    } catch {
      toast('error', 'Failed to update source');
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/job-sources/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        onSourceDeleted(deleteTarget.id);
        toast('success', `Removed ${deleteTarget.company_name}`);
      }
    } catch {
      toast('error', 'Failed to delete source');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleTestScrape(source: JobSource) {
    setTestingSources((prev) => new Set(prev).add(source.id));
    try {
      const res = await fetch('/api/jobs/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_id: source.id }),
      });
      const data = await res.json();
      if (res.ok && data.results?.[0]) {
        const r = data.results[0];
        if (r.error) {
          toast(r.country_filtered > 0 ? 'info' : 'error', `${source.company_name}: ${r.error}`);
        } else {
          const countryNote = r.country_filtered > 0 ? ` (${r.country_filtered} filtered by country)` : '';
          toast(
            'success',
            `${source.company_name}: ${r.new_listings} new, ${r.updated} existing, ${r.removed} removed${countryNote}`,
          );
        }
        const srcRes = await fetch('/api/job-sources');
        const srcData = await srcRes.json();
        const updated = (srcData.sources || []).find((s: JobSource) => s.id === source.id);
        if (updated) onSourceUpdated(updated);
      }
    } catch {
      toast('error', `Test scrape failed for ${source.company_name}`);
    } finally {
      setTestingSources((prev) => {
        const next = new Set(prev);
        next.delete(source.id);
        return next;
      });
    }
  }

  async function handleCountryToggle(source: JobSource, country: string) {
    const current = source.target_countries || [];
    const updated = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];

    if (updated.length === 0) {
      toast('error', 'At least one target country is required');
      return;
    }

    try {
      const res = await fetch(`/api/job-sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_countries: updated }),
      });
      const data = await res.json();
      if (res.ok) {
        onSourceUpdated(data.source);
      } else {
        toast('error', 'Failed to update countries');
      }
    } catch {
      toast('error', 'Failed to update countries');
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const hours = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  }

  function CountryChips({ countries, onToggle }: { countries: string[]; onToggle?: (country: string) => void }) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {countries.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--bg-surface-3)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]"
          >
            {c}
            {onToggle && (
              <button
                onClick={() => onToggle(c)}
                className="ml-0.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer"
                aria-label={`Remove ${c}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </span>
        ))}
      </div>
    );
  }

  function CountrySelector({ sourceId, currentCountries, onToggle }: {
    sourceId: string;
    currentCountries: string[];
    onToggle: (country: string) => void;
  }) {
    const available = TARGET_COUNTRY_OPTIONS.filter((c) => !currentCountries.includes(c));
    if (available.length === 0) return null;

    return (
      <div className="flex items-center gap-1 flex-wrap mt-1">
        {editingCountries === sourceId ? (
          <>
            {available.map((c) => (
              <button
                key={c}
                onClick={() => onToggle(c)}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--bg-surface-2)] text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] hover:border-[var(--primary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
              >
                + {c}
              </button>
            ))}
            <button
              onClick={() => setEditingCountries(null)}
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer ml-1"
            >
              done
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditingCountries(sourceId)}
            className="p-0.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
            title="Add country"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sources table */}
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        {sources.length === 0 ? (
          <div className="py-10 text-center text-xs text-[var(--text-muted)]">
            No career pages being watched yet. Add one below.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {sources.map((source) => (
              <div
                key={source.id}
                className={`p-3.5 transition-colors ${source.is_active ? '' : 'opacity-50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        {source.company_name}
                      </span>
                      {source.fetch_mode !== 'auto' && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--bg-surface-3)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
                          {source.fetch_mode}
                        </span>
                      )}
                      {!source.is_active && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--bg-surface-3)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                          PAUSED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">
                      {source.career_url}
                    </div>

                    {/* Country chips */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <CountryChips
                        countries={source.target_countries || ['Switzerland']}
                        onToggle={(c) => handleCountryToggle(source, c)}
                      />
                      <CountrySelector
                        sourceId={source.id}
                        currentCountries={source.target_countries || ['Switzerland']}
                        onToggle={(c) => handleCountryToggle(source, c)}
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--text-muted)]">
                      <span>Last scraped: {formatDate(source.last_scraped_at)}</span>
                      {source.last_error && (
                        <span className="flex items-center gap-1 text-[var(--status-follow-up)]">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="truncate max-w-[200px]" title={source.last_error}>
                            {source.last_error}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleTestScrape(source)}
                      disabled={testingSources.has(source.id)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer disabled:opacity-50"
                      title="Test scrape"
                    >
                      {testingSources.has(source.id) ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <TestTube className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggle(source)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
                      title={source.is_active ? 'Pause monitoring' : 'Resume monitoring'}
                    >
                      {source.is_active ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(source)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-dim)] transition-colors cursor-pointer"
                      title="Remove source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add source form */}
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-3">
          Add New Source
        </h3>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="input-base flex-1 text-xs"
          />
          <input
            type="url"
            placeholder="https://example.com/careers"
            value={careerUrl}
            onChange={(e) => setCareerUrl(e.target.value)}
            className="input-base flex-[2] text-xs"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !companyName.trim() || !careerUrl.trim()}
            className="btn-gold text-xs px-4 py-2 rounded-md whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            {adding ? 'Adding...' : 'Add Source'}
          </button>
        </div>

        {/* Country selection for new source */}
        <div className="mt-2.5">
          <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Target countries
          </span>
          <div className="flex items-center gap-1 flex-wrap mt-1">
            {TARGET_COUNTRY_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() =>
                  setNewCountries((prev) =>
                    prev.includes(c)
                      ? prev.length > 1 ? prev.filter((p) => p !== c) : prev
                      : [...prev, c],
                  )
                }
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  newCountries.includes(c)
                    ? 'bg-[var(--primary)] text-white border-transparent'
                    : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-tertiary)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Source"
        message={`Remove ${deleteTarget?.company_name}? This will also delete all scraped job listings from this source.`}
        confirmLabel="Remove"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
