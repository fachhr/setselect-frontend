import { Badge } from '@/components/ui/Badge';
import type { RecruiterStatus } from '@/types/recruiter';

const statusConfig: Record<RecruiterStatus, { label: string; variant: 'blue' | 'purple' | 'gold' | 'warning' | 'success' | 'error' | 'muted' }> = {
  new: { label: 'New', variant: 'blue' },
  screening: { label: 'Screening', variant: 'purple' },
  interviewing: { label: 'Interviewing', variant: 'gold' },
  offer: { label: 'Offer', variant: 'warning' },
  placed: { label: 'Placed', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'muted' },
};

interface StatusBadgeProps {
  status: RecruiterStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
