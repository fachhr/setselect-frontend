import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'blue' | 'purple' | 'gold' | 'success' | 'warning' | 'error';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  blue: 'bg-[var(--highlight-dim)] text-[var(--secondary)] border border-[rgba(144,224,239,0.30)]',
  purple: 'bg-[var(--secondary-dim)] text-[var(--highlight)] border border-[rgba(0,180,216,0.30)]',
  gold: 'bg-[var(--warning-dim)] text-[var(--warning)] border border-[var(--warning-border)]',
  success: 'bg-[var(--success-dim)] text-[var(--success)] border border-[var(--success-border)]',
  warning: 'bg-[var(--warning-dim)] text-[var(--warning)] border border-[var(--warning-border)]',
  error: 'bg-[var(--error-dim)] text-[var(--error)] border border-[var(--error-border)]',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
