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
    <div className="space-y-6 animate-in fade-in">
      <StatsCards stats={stats} />

      {/* Recent candidates */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
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
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-0)]">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Ref
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {recent.map((c) => (
                <tr
                  key={c.profile_id}
                  className="hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
                  onClick={() => router.push('/candidates')}
                >
                  <td className="px-4 py-3 text-[var(--text-accent)] font-mono text-xs">
                    {formatTalentId(c.talent_id)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[var(--text-primary)]">
                      {c.contact_first_name} {c.contact_last_name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
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
