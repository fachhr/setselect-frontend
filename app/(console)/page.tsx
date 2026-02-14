'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCards } from '@/components/StatsCards';
import { StatusBadge } from '@/components/StatusBadge';
import { formatTalentId, formatEntryDate } from '@/lib/helpers';
import type { RecruiterCandidateView, RecruiterStats } from '@/types/recruiter';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<RecruiterStats>({ total: 0, active: 0, placed: 0, newThisWeek: 0 });
  const [recent, setRecent] = useState<RecruiterCandidateView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/candidates?limit=5')
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecent(data.candidates);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 max-w-4xl pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[var(--secondary)] opacity-[0.04] blur-[100px] rounded-full"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-[var(--primary)] opacity-[0.03] blur-[120px] rounded-full"></div>
      </div>
      <StatsCards stats={stats} />

      {/* Recent candidates */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Recent Candidates
          </h3>
          <button
            onClick={() => router.push('/candidates')}
            className="text-xs text-[var(--text-accent)] hover:text-[var(--secondary)] transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-strong)] bg-[var(--bg-surface-2)]">
                <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Ref
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {recent.map((c) => (
                <tr
                  key={c.profile_id}
                  className="hover:bg-[var(--bg-surface-2)] transition-all duration-200 cursor-pointer"
                  onClick={() => router.push('/candidates')}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-medium bg-[var(--bg-surface-2)] px-2 py-1 rounded text-[var(--text-accent)]">
                      {formatTalentId(c.talent_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[var(--text-primary)] font-bold">
                      {c.contact_first_name} {c.contact_last_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                    {formatEntryDate(c.profile_created_at, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
