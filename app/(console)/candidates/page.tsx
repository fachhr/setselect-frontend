'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CandidateTable } from '@/components/CandidateTable';
import { CandidateDetailPanel } from '@/components/CandidateDetailPanel';
import type { TableFilters, SortConfig } from '@/components/CandidateTable';
import { formatTalentId, formatEntryDate } from '@/lib/helpers';

import { toast } from '@/components/ui/Toast';
import type { RecruiterCandidateView, RecruiterStatus } from '@/types/recruiter';

const EMPTY_FILTERS: TableFilters = {
  talent_id: '',
  name: '',
  contact: '',
  location: [],
  status: [],
  owner: '',
  added: '',
};

const ITEMS_PER_PAGE = 20;

export default function CandidatesPage() {
  const [allCandidates, setAllCandidates] = useState<RecruiterCandidateView[]>([]);
  const [tableFilters, setTableFilters] = useState<TableFilters>({ ...EMPTY_FILTERS });
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecruiterStatus | ''>('');
  const [selected, setSelected] = useState<RecruiterCandidateView | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', '1');
      params.set('limit', '0');

      const res = await fetch(`/api/candidates?${params}`);
      const data = await res.json();

      setAllCandidates(data.candidates);
    } catch {
      toast('error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

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
  }, [allCandidates, tableFilters]);

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
      <SearchBar
        search={searchInput}
        onSearchChange={setSearchInput}
        status={statusFilter}
        onStatusChange={handleStatusFilterChange}
      />

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <CandidateTable
          candidates={paginatedCandidates}
          onSelect={setSelected}
          onDownloadCv={handleDownloadCv}
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
        />
      )}
    </div>
  );
}
