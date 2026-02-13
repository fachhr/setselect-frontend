'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatsCards } from '@/components/StatsCards';
import { SearchBar } from '@/components/SearchBar';
import { CandidateTable } from '@/components/CandidateTable';
import { CandidateDetailPanel } from '@/components/CandidateDetailPanel';
import { Pagination } from '@/components/Pagination';
import { toast } from '@/components/ui/Toast';
import type { RecruiterCandidateView, RecruiterStats, RecruiterStatus } from '@/types/recruiter';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<RecruiterCandidateView[]>([]);
  const [stats, setStats] = useState<RecruiterStats>({ total: 0, active: 0, placed: 0, newThisWeek: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecruiterStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<RecruiterCandidateView | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/candidates?${params}`);
      const data = await res.json();

      setCandidates(data.candidates);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch {
      toast('error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

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

  const handleUpdateStatus = async (profileId: string, status: RecruiterStatus) => {
    try {
      const res = await fetch(`/api/candidates/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      toast('success', 'Status updated');

      // Update local state
      setCandidates((prev) =>
        prev.map((c) =>
          c.profile_id === profileId ? { ...c, status } : c
        )
      );
      if (selected?.profile_id === profileId) {
        setSelected((prev) => prev ? { ...prev, status } : null);
      }
      fetchCandidates();
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
      setCandidates((prev) =>
        prev.map((c) =>
          c.profile_id === profileId ? { ...c, owner } : c
        )
      );
      if (selected?.profile_id === profileId) {
        setSelected((prev) => prev ? { ...prev, owner } : null);
      }
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

      // Update local state
      const updateNotes = (c: RecruiterCandidateView) =>
        c.profile_id === profileId
          ? { ...c, notes: [newNote, ...c.notes] }
          : c;

      setCandidates((prev) => prev.map(updateNotes));
      if (selected?.profile_id === profileId) {
        setSelected((prev) => prev ? updateNotes(prev) : null);
      }
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

      const removeNote = (c: RecruiterCandidateView) =>
        c.profile_id === profileId
          ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) }
          : c;

      setCandidates((prev) => prev.map(removeNote));
      if (selected?.profile_id === profileId) {
        setSelected((prev) => prev ? removeNote(prev) : null);
      }
    } catch {
      toast('error', 'Failed to delete note');
    }
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
    <div className="space-y-6 animate-in fade-in">
      <StatsCards stats={stats} />

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
          candidates={candidates}
          onSelect={setSelected}
          onDownloadCv={handleDownloadCv}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      {selected && (
        <CandidateDetailPanel
          candidate={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateOwner={handleUpdateOwner}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onDownloadCv={handleDownloadCv}
        />
      )}
    </div>
  );
}
