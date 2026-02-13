import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-gold',
  secondary:
    'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface-3)] hover:border-[var(--border-hover)] transition-all',
  outline:
    'bg-transparent text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface-2)] hover:border-[var(--border-hover)] transition-all',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-all',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
