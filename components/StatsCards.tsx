import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { RecruiterStats } from '@/types/recruiter';

const cards = [
  { key: 'total' as const, label: 'Total Candidates', icon: Users, color: 'text-[var(--secondary)]', bg: 'bg-[var(--secondary-dim)]' },
  { key: 'active' as const, label: 'Active Pipeline', icon: Clock, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-dim)]' },
  { key: 'placed' as const, label: 'Placed', icon: CheckCircle, color: 'text-[var(--success)]', bg: 'bg-[var(--success-dim)]' },
  { key: 'newThisWeek' as const, label: 'New This Week', icon: AlertCircle, color: 'text-[var(--highlight)]', bg: 'bg-[var(--primary-dim)]' },
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
          className="glass-panel rounded-xl p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
              {stats[card.key]}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
            <card.icon size={20} className={card.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
