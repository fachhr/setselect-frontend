'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, Loader2, Eye, Search, ChevronDown } from 'lucide-react';
import type { JobListing, JobListingStatus, JobSource, JobStats } from '@/types/recruiter';
import { JOB_STATUS_OPTIONS, JOB_SENIORITY_OPTIONS } from '@/lib/constants';
import { JobCard } from '@/components/JobCard';
import { JobSourcesTable } from '@/components/JobSourcesTable';
import { toast } from '@/components/ui/Toast';

type View = 'listings' | 'sources';

export default function JobsPage() {
  const [view, setView] = useState<View>('listings');
  const [listings, setListings] = useState<JobListing[]>([]);
  const [sources, setSources] = useState<JobSource[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [seniorityFilter, setSeniorityFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState('');
  const [includeRemoved, setIncludeRemoved] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '20');
    if (statusFilter.length > 0) params.set('status', statusFilter.join(','));
    if (seniorityFilter.length > 0) params.set('seniority', seniorityFilter.join(','));
    if (sourceFilter) params.set('source_id', sourceFilter);
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (includeRemoved) params.set('include_removed', 'true');

    try {
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      if (res.ok) {
        setListings(data.listings || []);
        setStats(data.stats || null);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      toast('error', 'Failed to load job listings');
    }
  }, [page, statusFilter, seniorityFilter, sourceFilter, debouncedSearch, includeRemoved]);

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch('/api/job-sources');
      const data = await res.json();
      if (res.ok) setSources(data.sources || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchListings(), fetchSources()]).finally(() => setLoading(false));
  }, [fetchListings, fetchSources]);

  // Debounce search input
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, seniorityFilter, sourceFilter, debouncedSearch, includeRemoved]);

  async function handleScrapeNow() {
    setScraping(true);
    try {
      const res = await fetch('/api/jobs/scrape', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.results) {
        const totalNew = data.results.reduce((sum: number, r: { new_listings: number }) => sum + r.new_listings, 0);
        const totalFiltered = data.results.reduce((sum: number, r: { country_filtered: number }) => sum + (r.country_filtered || 0), 0);
        const errors = data.results.filter((r: { error: string | null }) => r.error).length;
        const filteredNote = totalFiltered > 0 ? `, ${totalFiltered} filtered by country` : '';
        toast(
          errors > 0 ? 'info' : 'success',
          `Scrape complete: ${totalNew} new listings found${filteredNote}${errors > 0 ? `, ${errors} source(s) with errors` : ''}`,
        );
        fetchListings();
        fetchSources();
      } else {
        toast('error', data.error || 'Scrape failed');
      }
    } catch {
      toast('error', 'Scrape request failed');
    } finally {
      setScraping(false);
    }
  }

  function handleStatusChange(id: string, status: JobListingStatus) {
    // Optimistic update
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l)),
    );

    fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then((res) => {
      if (!res.ok) {
        toast('error', 'Failed to update status');
        fetchListings();
      }
    }).catch(() => {
      toast('error', 'Failed to update status');
      fetchListings();
    });
  }

  async function handleBulkEvaluating() {
    const newIds = listings.filter((l) => l.status === 'new').map((l) => l.id);
    if (newIds.length === 0) return;

    setListings((prev) =>
      prev.map((l) => (newIds.includes(l.id) ? { ...l, status: 'evaluating' as JobListingStatus } : l)),
    );

    try {
      const res = await fetch('/api/jobs/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newIds, status: 'evaluating' }),
      });
      if (res.ok) {
        toast('success', `${newIds.length} listing(s) marked as evaluating`);
      } else {
        toast('error', 'Bulk update failed');
        fetchListings();
      }
    } catch {
      toast('error', 'Bulk update failed');
      fetchListings();
    }
  }

  function toggleFilter(arr: string[], value: string, setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  const newCount = listings.filter((l) => l.status === 'new').length;

  // --- Skeletons ---
  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-[var(--bg-surface-3)] rounded animate-pulse" />
          <div className="h-8 w-28 bg-[var(--bg-surface-3)] rounded animate-pulse" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-4 animate-pulse">
            <div className="h-3 w-16 bg-[var(--bg-surface-3)] rounded mb-2" />
            <div className="h-4 w-64 bg-[var(--bg-surface-3)] rounded mb-1.5" />
            <div className="h-3 w-40 bg-[var(--bg-surface-3)] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] rounded-lg p-0.5">
          {(['listings', 'sources'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                view === v
                  ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]'
              }`}
            >
              {v === 'listings' ? 'Job Listings' : 'Watched Sites'}
              {/* Tab badges = inventory size (matches design convention). Attention
                  signals for untriaged jobs live on the "New" filter pill instead. */}
              {v === 'listings' && stats && (
                <span className="ml-1.5 text-[10px] px-1.5 py-px rounded-lg bg-[var(--bg-surface-3)] text-[var(--text-tertiary)]">
                  {stats.total}
                </span>
              )}
              {v === 'sources' && (
                <span className="ml-1.5 text-[10px] px-1.5 py-px rounded-lg bg-[var(--bg-surface-3)] text-[var(--text-tertiary)]">
                  {sources.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrape Now */}
        <button
          onClick={handleScrapeNow}
          disabled={scraping || sources.length === 0}
          className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-md bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
        >
          {scraping ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {scraping ? 'Scraping...' : 'Scrape Now'}
        </button>
      </div>

      {/* Listings view */}
      {view === 'listings' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-[200px]">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base w-full pl-[30px] pr-3 py-1.5 text-[11px] rounded-md"
              />
            </div>

            {/* Status pills */}
            <div className="flex gap-1 flex-wrap">
              {JOB_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleFilter(statusFilter, opt.value, setStatusFilter)}
                  aria-pressed={statusFilter.includes(opt.value)}
                  className={`px-2.5 py-[5px] text-[10px] font-medium rounded-md border transition-colors cursor-pointer ${
                    statusFilter.includes(opt.value)
                      ? 'bg-[var(--primary)] text-white border-transparent'
                      : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-tertiary)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Divider between filter groups */}
            <div className="hidden sm:block w-px h-5 bg-[var(--border-subtle)]" />

            {/* Seniority pills */}
            <div className="flex gap-1 flex-wrap">
              {JOB_SENIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleFilter(seniorityFilter, opt.value, setSeniorityFilter)}
                  aria-pressed={seniorityFilter.includes(opt.value)}
                  className={`px-2.5 py-[5px] text-[10px] font-medium rounded-md border transition-colors cursor-pointer ${
                    seniorityFilter.includes(opt.value)
                      ? 'bg-[var(--primary)] text-white border-transparent'
                      : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-tertiary)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Source dropdown */}
            {sources.length > 1 && (
              <div className="relative">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="input-base appearance-none pl-3 pr-7 py-1.5 text-[11px] rounded-md cursor-pointer"
                >
                  <option value="">All companies</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.company_name}</option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
                />
              </div>
            )}

            {/* Include closed toggle */}
            <button
              onClick={() => setIncludeRemoved(!includeRemoved)}
              className={`flex items-center gap-1.5 font-medium px-3 py-[5px] text-[11px] rounded-md border border-[var(--border-strong)] cursor-pointer transition-colors ${
                includeRemoved
                  ? 'bg-[var(--bg-surface-3)] text-[var(--text-secondary)]'
                  : 'bg-[var(--bg-surface-2)] text-[var(--text-tertiary)]'
              }`}
            >
              <Eye size={12} />
              Closed roles
            </button>
          </div>

          {/* Bulk action */}
          {newCount > 1 && (
            <button
              onClick={handleBulkEvaluating}
              className="text-[11px] font-medium text-[var(--text-accent)] hover:text-[var(--primary)] transition-colors cursor-pointer"
            >
              Mark all {newCount} new as evaluating
            </button>
          )}

          {/* Listing cards */}
          {listings.length === 0 ? (
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg py-12 text-center">
              {sources.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">
                  No career pages being watched yet.{' '}
                  <button
                    onClick={() => setView('sources')}
                    className="text-[var(--text-accent)] hover:text-[var(--primary)] transition-colors cursor-pointer underline underline-offset-2"
                  >
                    Add a Watched Site
                  </button>
                  {' '}to get started.
                </p>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">
                  No job listings found. Try adjusting your filters or run a scrape.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {listings.map((listing) => (
                <JobCard
                  key={listing.id}
                  listing={listing}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border border-[var(--border-strong)] rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-2 py-1 text-xs text-[var(--text-muted)]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-[var(--border-strong)] rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Stats footer */}
          {stats && (
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2.5 mt-1">
              <span>
                {stats.total} total · {stats.new_count} new · {stats.pursuing_count} pursuing · {stats.sources_count} source(s)
              </span>
              {stats.last_scrape_at && (
                <span>
                  Last scrape: {new Date(stats.last_scrape_at).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {/* Sources view */}
      {view === 'sources' && (
        <JobSourcesTable
          sources={sources}
          onSourceAdded={(s) => setSources((prev) => [...prev, s])}
          onSourceUpdated={(s) =>
            setSources((prev) => prev.map((p) => (p.id === s.id ? s : p)))
          }
          onSourceDeleted={(id) =>
            setSources((prev) => prev.filter((s) => s.id !== id))
          }
        />
      )}
    </div>
  );
}
