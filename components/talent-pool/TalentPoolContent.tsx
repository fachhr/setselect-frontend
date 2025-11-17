'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import FilterBar, { FilterState } from '@/components/talent-pool/FilterBar';
import TalentTable from '@/components/talent-pool/TalentTable';
import Pagination from '@/components/talent-pool/Pagination';
import ContactInfo from '@/components/talent-pool/ContactInfo';
import { TalentPoolListResponse, AnonymizedTalentProfile } from '@/types/talentPool';
import { SALARY_MIN, SALARY_MAX } from '@/lib/constants';

/**
 * TalentPoolContent Component
 *
 * Separated from page.tsx to handle Next.js 15 Suspense requirements.
 * This component uses useSearchParams() which requires a Suspense boundary.
 */
export default function TalentPoolContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial state from URL
  const [filters, setFilters] = useState<FilterState>({
    seniority: (searchParams.get('seniority') as any) || 'all',
    cantons: searchParams.get('cantons')?.split(',').filter(Boolean) || [],
    salaryMin: parseInt(searchParams.get('salary_min') || String(SALARY_MIN), 10),
    salaryMax: parseInt(searchParams.get('salary_max') || String(SALARY_MAX), 10),
  });

  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc'
  );
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [candidates, setCandidates] = useState<AnonymizedTalentProfile[]>([]);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API with request cancellation support
  const fetchCandidates = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Add filters
      if (filters.seniority !== 'all') {
        params.set('seniority', filters.seniority);
      }
      if (filters.cantons.length > 0) {
        params.set('cantons', filters.cantons.join(','));
      }
      if (filters.salaryMin !== SALARY_MIN) {
        params.set('salary_min', filters.salaryMin.toString());
      }
      if (filters.salaryMax !== SALARY_MAX) {
        params.set('salary_max', filters.salaryMax.toString());
      }

      // Add sorting and pagination
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      const response = await fetch(`/api/talent-pool/list?${params.toString()}`, { signal });
      const data: TalentPoolListResponse = await response.json();

      if (data.success) {
        setCandidates(data.data.candidates);
        setPagination(data.data.pagination);
      } else {
        setError('Failed to load candidates');
      }
    } catch (err) {
      // Don't show error if request was aborted (user navigated away or changed filters)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      }
      console.error('Error fetching candidates:', err);
      setError('An error occurred while loading candidates');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder, currentPage]);

  // Unified effect: Update URL AND fetch data when filters change
  // This prevents the double-fetch bug that occurred with separate effects
  // Includes AbortController to cancel in-flight requests on filter changes
  useEffect(() => {
    // Create AbortController to cancel previous request if filters change again
    const abortController = new AbortController();

    // Update URL
    const params = new URLSearchParams();

    if (filters.seniority !== 'all') {
      params.set('seniority', filters.seniority);
    }
    if (filters.cantons.length > 0) {
      params.set('cantons', filters.cantons.join(','));
    }
    if (filters.salaryMin !== SALARY_MIN) {
      params.set('salary_min', filters.salaryMin.toString());
    }
    if (filters.salaryMax !== SALARY_MAX) {
      params.set('salary_max', filters.salaryMax.toString());
    }
    params.set('sort_by', sortBy);
    params.set('sort_order', sortOrder);
    params.set('page', currentPage.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/${newUrl}`, { scroll: false });

    // Fetch data with cancellation token
    fetchCandidates(abortController.signal);

    // Cleanup: Cancel request if component unmounts or filters change
    return () => {
      abortController.abort();
    };
  }, [filters, sortBy, sortOrder, currentPage, router, fetchCandidates]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort changes
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle order if same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        background: 'var(--background-gradient)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1
                className="text-4xl sm:text-5xl font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Silvia's List
              </h1>
              <p
                className="text-lg sm:text-xl max-w-3xl"
                style={{ color: 'var(--text-secondary)' }}
              >
                Discover exceptional tech talent in Switzerland. Browse pre-screened professionals
                ready for their next opportunity.
              </p>
            </div>

            {/* Join Button */}
            <div className="flex-shrink-0">
              <Link href="/join">
                <Button variant="gold" size="lg">
                  Join Silvia's List
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Filters */}
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />

          {/* Results Count */}
          {!loading && !error && (
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {pagination.total === 0 ? (
                'No candidates found'
              ) : (
                <>
                  Showing <span style={{ color: 'var(--accent-gold)' }}>{pagination.total}</span>{' '}
                  {pagination.total === 1 ? 'candidate' : 'candidates'}
                </>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div
              className="rounded-lg p-6 text-center"
              style={{
                backgroundColor: 'var(--error-bg)',
                borderColor: 'var(--error-color)',
                borderWidth: '1px',
              }}
            >
              <p style={{ color: 'var(--error-color)' }}>{error}</p>
              <button
                onClick={() => fetchCandidates()}
                className="mt-4 px-6 py-2 rounded-md font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Talent Table */}
          <TalentTable
            candidates={candidates}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            loading={loading}
          />

          {/* Pagination */}
          {!loading && !error && pagination.total_pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              totalResults={pagination.total}
              resultsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}

          {/* Contact Info */}
          <ContactInfo />
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          <p>&copy; {new Date().getFullYear()} Silvia's List. All rights reserved.</p>
          <p className="mt-2">
            <a
              href="/terms"
              className="transition-colors"
              style={{ color: 'var(--accent-gold)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
            >
              Terms & Conditions
            </a>
            {' • '}
            <a
              href="mailto:contact@silviaslist.com"
              className="transition-colors"
              style={{ color: 'var(--accent-gold)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
            >
              Contact
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
