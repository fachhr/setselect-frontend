import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'blue' | 'purple' | 'gold' | 'success' | 'warning' | 'error';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  blue: 'bg-[#1e3a5f] text-[#93c5fd] border border-[rgba(59,130,246,0.30)]',
  purple: 'bg-[#2d1f5e] text-[#c4b5fd] border border-[rgba(139,92,246,0.30)]',
  gold: 'bg-[#3d2f0a] text-[#fcd34d] border border-[var(--warning-border)]',
  success: 'bg-[#064e3b] text-[#6ee7b7] border border-[var(--success-border)]',
  warning: 'bg-[#3d1f0a] text-[#fdba74] border border-[var(--warning-border)]',
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
