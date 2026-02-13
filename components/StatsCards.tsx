import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { RecruiterStats } from '@/types/recruiter';

const cards = [
  { key: 'total' as const, label: 'Total Candidates', icon: Users, color: 'text-[var(--secondary)]' },
  { key: 'active' as const, label: 'Active Pipeline', icon: Clock, color: 'text-[var(--warning)]' },
  { key: 'placed' as const, label: 'Placed', icon: CheckCircle, color: 'text-[var(--success)]' },
  { key: 'newThisWeek' as const, label: 'New This Week', icon: AlertCircle, color: 'text-[var(--highlight)]' },
];

interface StatsCardsProps {
  stats: RecruiterStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="glass-panel rounded-xl p-5 flex items-center gap-4"
        >
          <div className={`p-2.5 rounded-lg bg-[var(--bg-surface-2)] ${card.color}`}>
            <card.icon size={22} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[var(--text-primary)]">
              {stats[card.key]}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
