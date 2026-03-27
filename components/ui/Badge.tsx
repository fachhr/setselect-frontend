import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'blue' | 'purple' | 'gold' | 'success' | 'warning' | 'error' | 'muted';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  blue: 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] border border-[var(--badge-blue-border)]',
  purple: 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border border-[var(--badge-purple-border)]',
  gold: 'bg-[var(--badge-gold-bg)] text-[var(--badge-gold-text)] border border-[var(--warning-border)]',
  success: 'bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border border-[var(--success-border)]',
  warning: 'bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] border border-[var(--warning-border)]',
  error: 'bg-[var(--error-dim)] text-[var(--error)] border border-[var(--error-border)]',
  muted: 'bg-[var(--badge-muted-bg)] text-[var(--badge-muted-text)] border border-[var(--badge-muted-border)]',
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
