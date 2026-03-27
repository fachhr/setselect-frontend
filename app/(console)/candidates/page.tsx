'use client';

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { CandidateTable } from '@/components/CandidateTable';
import { CandidateDetailPanel } from '@/components/CandidateDetailPanel';
import { BoardView } from '@/components/BoardView';
import { ViewToggle } from '@/components/ui/ViewToggle';
import type { TableFilters, SortConfig } from '@/components/CandidateTable';
import { formatTalentId, formatEntryDate } from '@/lib/helpers';

import { toast } from '@/components/ui/Toast';
import type { RecruiterCandidateView, RecruiterStatus, ProfileEditData, CandidateSubmission, SubmissionStatus, SubmissionCompany } from '@/types/recruiter';

const EMPTY_FILTERS: TableFilters = {
  talent_id: '',
  name: '',
  contact: '',
  location: [],
  experience: [],
  status: [],
  owner: '',
  added: '',
};

const ITEMS_PER_PAGE = 20;

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" /></div>}>
      <CandidatesContent />
    </Suspense>
  );
}

function CandidatesContent() {
  const [allCandidates, setAllCandidates] = useState<RecruiterCandidateView[]>([]);
  const [tableFilters, setTableFilters] = useState<TableFilters>({ ...EMPTY_FILTERS });
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecruiterStatus | ''>('');
  const [selected, setSelected] = useState<RecruiterCandidateView | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [staleOnly, setStaleOnly] = useState(false);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<CandidateSubmission[]>([]);
  const [companies, setCompanies] = useState<SubmissionCompany[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('talentPoolView') as 'board' | 'table') || 'table';
    }
    return 'table';
  });
  const searchParams = useSearchParams();

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', '1');
      params.set('limit', '0');

      const res = await fetch(`/api/candidates?${params}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setAllCandidates(data.candidates ?? []);
    } catch {
      toast('error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Handle URL params (e.g., from Command Center pipeline click)
  useEffect(() => {
    const statusParam = searchParams.get('status') as RecruiterStatus | null;
    if (statusParam) setStatusFilter(statusParam);
  }, [searchParams]);

  // Persist view mode
  const handleViewChange = (view: 'board' | 'table') => {
    setViewMode(view);
    localStorage.setItem('talentPoolView', view);
  };

  // Fetch all submissions for board view dots
  useEffect(() => {
    fetch('/api/submissions')
      .then((res) => res.json())
      .then((data) => setAllSubmissions(data.submissions ?? []))
      .catch(() => {/* non-blocking */});
  }, []);

  // Fetch submission companies (separate from platform-access companies)
  useEffect(() => {
    fetch('/api/submission-companies')
      .then((res) => res.json())
      .then((data) => setCompanies(data.companies ?? []))
      .catch(() => {/* non-blocking */});
  }, []);

  // Fetch submissions when a candidate is selected
  useEffect(() => {
    if (!selected) {
      setSubmissions([]);
      return;
    }
    fetch(`/api/submissions?profile_id=${selected.profile_id}`)
      .then((res) => res.json())
      .then((data) => setSubmissions(data.submissions ?? []))
      .catch(() => setSubmissions([]));
  }, [selected?.profile_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusFilterChange = (value: RecruiterStatus | '') => {
    setStatusFilter(value);
    setPage(1);
  };

  // --- Three-stage useMemo pipeline ---

  // Stage 1: Filter
  const filteredCandidates = useMemo(() => {
    return allCandidates.filter((c) => {
      // Favorites filter
      if (favoritesOnly && !c.is_favorite) return false;

      // Stale filter
      if (staleOnly) {
        const activityDate = c.last_activity_at || c.status_changed_at;
        const days = Math.floor((Date.now() - new Date(activityDate).getTime()) / (1000 * 60 * 60 * 24));
        const isTerminal = c.status === 'placed' || c.status === 'rejected';
        if (isTerminal || days < 5) return false;
      }

      // Text filters
      if (tableFilters.talent_id) {
        const formatted = formatTalentId(c.talent_id);
        if (!formatted.toLowerCase().includes(tableFilters.talent_id.toLowerCase()) &&
            !(c.talent_id?.toLowerCase().includes(tableFilters.talent_id.toLowerCase()))) {
          return false;
        }
      }

      if (tableFilters.name) {
        const fullName = `${c.contact_first_name} ${c.contact_last_name}`.toLowerCase();
        const role = (c.desired_roles || '').toLowerCase();
        const q = tableFilters.name.toLowerCase();
        if (!fullName.includes(q) && !role.includes(q)) return false;
      }

      if (tableFilters.contact) {
        const contactStr = `${c.email} ${c.country_code}${c.phoneNumber}`.toLowerCase();
        if (!contactStr.includes(tableFilters.contact.toLowerCase())) return false;
      }

      // Multi-select: Location
      if (tableFilters.location.length > 0) {
        if (!c.desired_locations || !c.desired_locations.some((loc) =>
          tableFilters.location.includes(loc)
        )) return false;
      }

      // Multi-select: Experience
      if (tableFilters.experience.length > 0) {
        const yoe = c.years_of_experience ?? 0;
        const inRange = tableFilters.experience.some((range) => {
          switch (range) {
            case '0-2': return yoe >= 0 && yoe <= 2;
            case '3-5': return yoe >= 3 && yoe <= 5;
            case '6-10': return yoe >= 6 && yoe <= 10;
            case '10+': return yoe > 10;
            default: return false;
          }
        });
        if (!inRange) return false;
      }

      // Multi-select: Status
      if (tableFilters.status.length > 0) {
        if (!tableFilters.status.includes(c.status)) return false;
      }

      // Text: Owner
      if (tableFilters.owner) {
        if (!(c.owner?.toLowerCase().includes(tableFilters.owner.toLowerCase()))) return false;
      }

      // Text: Added
      if (tableFilters.added) {
        const formatted = formatEntryDate(c.profile_created_at, true);
        if (!formatted.toLowerCase().includes(tableFilters.added.toLowerCase())) return false;
      }

      return true;
    });
  }, [allCandidates, tableFilters, favoritesOnly, staleOnly]);

  // Stage 2: Sort
  const sortedCandidates = useMemo(() => {
    if (!sortConfig) return filteredCandidates;

    const { key, direction } = sortConfig;

    return [...filteredCandidates].sort((a, b) => {
      let aVal: string | number | null = null;
      let bVal: string | number | null = null;

      switch (key) {
        case 'talent_id':
          aVal = a.talent_id || '';
          bVal = b.talent_id || '';
          break;
        case 'name':
          aVal = `${a.contact_first_name} ${a.contact_last_name}`.toLowerCase();
          bVal = `${b.contact_first_name} ${b.contact_last_name}`.toLowerCase();
          break;
        case 'location':
          aVal = (a.desired_locations?.[0] || '').toLowerCase();
          bVal = (b.desired_locations?.[0] || '').toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'experience':
          aVal = a.years_of_experience ?? null;
          bVal = b.years_of_experience ?? null;
          break;
        case 'owner':
          aVal = (a.owner || '').toLowerCase();
          bVal = (b.owner || '').toLowerCase();
          break;
        case 'added':
          aVal = a.profile_created_at ? new Date(a.profile_created_at).getTime() : null;
          bVal = b.profile_created_at ? new Date(b.profile_created_at).getTime() : null;
          break;
        default:
          return 0;
      }

      // Null-safe: push nulls to end
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      return direction === 'desc' ? -cmp : cmp;
    });
  }, [filteredCandidates, sortConfig]);

  // Stage 3: Paginate
  const totalPages = Math.ceil(sortedCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedCandidates.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedCandidates, page]);

  // --- Dynamic filter options ---
  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    allCandidates.forEach((c) => {
      c.desired_locations?.forEach((loc) => set.add(loc));
    });
    return Array.from(set).sort().map((loc) => ({ value: loc, label: loc }));
  }, [allCandidates]);

  // --- Handlers ---
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const handleFilterChange = (key: keyof TableFilters, value: string | string[]) => {
    setTableFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // --- CRUD handlers (unchanged) ---
  const updateCandidateLocally = useCallback(
    (profileId: string, updater: (c: RecruiterCandidateView) => RecruiterCandidateView) => {
      setAllCandidates((prev) => prev.map((c) => (c.profile_id === profileId ? updater(c) : c)));
      setSelected((prev) => (prev?.profile_id === profileId ? updater(prev) : prev));
    },
    []
  );

  const handleCreateSubmission = async (companyId: string, submittedBy: string, notes: string) => {
    if (!selected) return;
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: selected.profile_id,
          company_id: companyId,
          submitted_by: submittedBy || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast('error', data.error || 'Failed to create submission');
        throw new Error('Create failed');
      }
      const data = await res.json();
      setSubmissions((prev) => [data.submission, ...prev]);
      // Add timeline entry locally so it shows immediately
      const sub = data.submission;
      updateCandidateLocally(selected.profile_id, (c) => ({
        ...c,
        notes: [{
          type: 'submission_created' as const,
          id: crypto.randomUUID(),
          company_name: sub.company_name,
          submission_id: sub.id,
          author: submittedBy || 'System',
          created_at: new Date().toISOString(),
        }, ...c.notes],
      }));
      toast('success', 'Submission recorded');
    } catch {
      // error already toasted above if API error
    }
  };

  const handleUpdateSubmission = async (submissionId: string, status: SubmissionStatus) => {
    const oldSubmission = submissions.find(s => s.id === submissionId);
    // Optimistic update
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status } : s))
    );
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      // Add timeline entry locally
      if (oldSubmission && selected) {
        updateCandidateLocally(selected.profile_id, (c) => ({
          ...c,
          notes: [{
            type: 'submission_update' as const,
            id: crypto.randomUUID(),
            company_name: oldSubmission.company_name,
            submission_id: submissionId,
            from: oldSubmission.status,
            to: status,
            author: 'System',
            created_at: new Date().toISOString(),
          }, ...c.notes],
        }));
      }
      toast('success', 'Submission updated');
    } catch {
      // Revert — refetch
      if (selected) {
        fetch(`/api/submissions?profile_id=${selected.profile_id}`)
          .then((res) => res.json())
          .then((data) => setSubmissions(data.submissions ?? []));
      }
      toast('error', 'Failed to update submission');
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      // Also remove related timeline entries from candidate's local notes
      if (data.profile_id) {
        updateCandidateLocally(data.profile_id, (c) => ({
          ...c,
          notes: c.notes.filter((n) => !('submission_id' in n) || (n as { submission_id?: string }).submission_id !== submissionId),
        }));
      }
      toast('success', 'Submission removed');
    } catch {
      toast('error', 'Failed to remove submission');
    }
  };

  const handleToggleFavorite = async (profileId: string) => {
    const candidate = allCandidates.find((c) => c.profile_id === profileId);
    if (!candidate) return;
    const newValue = !candidate.is_favorite;

    // Optimistic update
    updateCandidateLocally(profileId, (c) => ({ ...c, is_favorite: newValue }));

    try {
      const res = await fetch(`/api/candidates/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: newValue }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      updateCandidateLocally(profileId, (c) => ({ ...c, is_favorite: !newValue }));
      toast('error', 'Failed to update favorite');
    }
  };

  const handleUpdateStatus = async (profileId: string, status: RecruiterStatus) => {
    try {
      const res = await fetch(`/api/candidates/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast('success', 'Status updated');
      updateCandidateLocally(profileId, (c) => ({ ...c, status }));
    } catch {
      toast('error', 'Failed to update status');
    }
  };

  const handleUpdateOwner = async (profileId: string, owner: string) => {
    try {
      const res = await fetch(`/api/candidates/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner }),
      });
      if (!res.ok) throw new Error();
      toast('success', 'Owner updated');
      updateCandidateLocally(profileId, (c) => ({ ...c, owner }));
    } catch {
      toast('error', 'Failed to update owner');
    }
  };

  const handleAddNote = async (profileId: string, text: string) => {
    try {
      const res = await fetch(`/api/candidates/${profileId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const newNote = await res.json();
      toast('success', 'Note added');
      updateCandidateLocally(profileId, (c) => ({ ...c, notes: [newNote, ...c.notes] }));
    } catch {
      toast('error', 'Failed to add note');
    }
  };

  const handleDeleteNote = async (profileId: string, noteId: string) => {
    try {
      const res = await fetch(`/api/candidates/${profileId}/notes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });
      if (!res.ok) throw new Error();
      toast('success', 'Note deleted');
      updateCandidateLocally(profileId, (c) => ({
        ...c,
        notes: c.notes.filter((n) => n.id !== noteId),
      }));
    } catch {
      toast('error', 'Failed to delete note');
    }
  };

  const handleDeleteCandidate = async (profileId: string) => {
    let res: Response;
    try {
      res = await fetch(`/api/candidates/${profileId}`, { method: 'DELETE' });
    } catch {
      toast('error', 'Network error — could not delete profile');
      throw new Error('Delete failed');
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast('error', data.error || 'Failed to delete profile');
      throw new Error('Delete failed');
    }
    setAllCandidates((prev) => prev.filter((c) => c.profile_id !== profileId));
    setSelected(null);
    toast('success', 'Profile deleted');
  };

  const handleUpdateProfile = async (profileId: string, formData: ProfileEditData) => {
    const apiBody: Record<string, unknown> = {
      contact_first_name: formData.contact_first_name,
      contact_last_name: formData.contact_last_name,
      email: formData.email,
      country_code: formData.country_code,
      phoneNumber: formData.phoneNumber,
      linkedinUrl: formData.linkedinUrl || null,
      desired_roles: formData.desired_roles || null,
      desired_locations: formData.desired_locations.length > 0 ? formData.desired_locations : null,
      work_eligibility: formData.work_eligibility || null,
      short_summary: formData.short_summary || null,
      notice_period_months: formData.notice_period_months || null,
      functional_expertise: formData.functional_expertise.length > 0 ? formData.functional_expertise : null,
      languages: formData.languages.length > 0 ? formData.languages : null,
      years_of_experience: formData.years_of_experience ? Number(formData.years_of_experience) : null,
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null,
    };

    const res = await fetch(`/api/candidates/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiBody),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast('error', data.error || 'Failed to update profile');
      throw new Error('Update failed');
    }

    toast('success', 'Profile updated');
    updateCandidateLocally(profileId, (c) => ({
      ...c,
      contact_first_name: formData.contact_first_name,
      contact_last_name: formData.contact_last_name,
      email: formData.email,
      country_code: formData.country_code,
      phoneNumber: formData.phoneNumber,
      linkedinUrl: formData.linkedinUrl || null,
      desired_roles: formData.desired_roles || null,
      desired_locations: formData.desired_locations.length > 0 ? formData.desired_locations : [],
      work_eligibility: formData.work_eligibility || null,
      short_summary: formData.short_summary || null,
      notice_period_months: formData.notice_period_months || '',
      functional_expertise: formData.functional_expertise.length > 0 ? formData.functional_expertise : null,
      languages: formData.languages.length > 0 ? formData.languages : null,
      years_of_experience: formData.years_of_experience ? Number(formData.years_of_experience) : 0,
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null,
    }));
  };

  const handleDownloadCv = async (profileId: string) => {
    try {
      const res = await fetch(`/api/candidates/${profileId}/cv`);
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast('error', 'CV not available');
        return;
      }
      window.open(data.url, '_blank');
    } catch {
      toast('error', 'Failed to download CV');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between gap-4">
        <ViewToggle value={viewMode} onChange={handleViewChange} />
        <SearchBar
          search={searchInput}
          onSearchChange={setSearchInput}
          status={statusFilter}
          onStatusChange={handleStatusFilterChange}
          favoritesOnly={favoritesOnly}
          onToggleFavoritesFilter={() => setFavoritesOnly((prev) => !prev)}
          staleOnly={staleOnly}
          onToggleStaleFilter={() => setStaleOnly((prev) => !prev)}
          shortlistCount={allCandidates.filter((c) => c.is_favorite).length}
          totalCount={allCandidates.length}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : viewMode === 'board' ? (
        <BoardView
          candidates={filteredCandidates}
          submissions={allSubmissions}
          onSelect={setSelected}
        />
      ) : (
        <CandidateTable
          candidates={paginatedCandidates}
          onSelect={setSelected}
          onDownloadCv={handleDownloadCv}
          onToggleFavorite={handleToggleFavorite}
          onStatusChange={handleUpdateStatus}
          allSubmissions={allSubmissions}
          sortConfig={sortConfig}
          onSort={handleSort}
          filters={tableFilters}
          onFilterChange={handleFilterChange}
          page={page}
          totalPages={totalPages}
          total={allCandidates.length}
          filteredCount={sortedCandidates.length}
          onPageChange={setPage}
          locationOptions={locationOptions}
          favoritesOnly={favoritesOnly}
          onToggleFavoritesFilter={() => setFavoritesOnly((prev) => !prev)}
        />
      )}

      {selected && (
        <CandidateDetailPanel
          candidate={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateOwner={handleUpdateOwner}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onDownloadCv={handleDownloadCv}
          onDelete={handleDeleteCandidate}
          onUpdateProfile={handleUpdateProfile}
          onToggleFavorite={handleToggleFavorite}
          submissions={submissions}
          companies={companies}
          onCreateSubmission={handleCreateSubmission}
          onUpdateSubmission={handleUpdateSubmission}
          onDeleteSubmission={handleDeleteSubmission}
          onCompanyAdded={(company) => setCompanies((prev) => [...prev, company].sort((a, b) => a.name.localeCompare(b.name)))}
        />
      )}
    </div>
  );
}
