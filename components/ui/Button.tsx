import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'solid' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    // Base styles - consistent across all variants
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

    // Size variants
    const sizeStyles = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    // Variant styles - Premium Burgundy Sanctuary Palette
    const variantStyles = {
      // GOLD: Premium CTA - Champagne gold with dark burgundy text & glow
      gold: 'bg-[var(--accent-gold)] text-[var(--button-text-on-gold)] shadow-lg hover:bg-[var(--accent-gold-hover)] transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-[var(--light-400)] disabled:text-[var(--text-disabled)] disabled:shadow-none disabled:transform-none',
      // Primary: Navy - Trust elements, links, secondary CTAs
      primary: 'bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary-dark)] hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-[var(--light-600)] disabled:text-[var(--text-disabled)] disabled:shadow-none disabled:transform-none',
      // Secondary: Burgundy with border - Alternative actions
      secondary: 'bg-[var(--surface-1)] text-[var(--text-primary)] border-2 border-[var(--light-400)] shadow-sm hover:bg-[var(--surface-2)] hover:border-[var(--accent-gold)] hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-[var(--light-600)] disabled:text-[var(--text-disabled)] disabled:border-[var(--light-400)] disabled:shadow-none disabled:transform-none',
      // Solid: Lighter burgundy background
      solid: 'bg-[var(--light-800)] text-[var(--text-primary)] shadow hover:bg-[var(--light-600)] disabled:bg-[var(--light-600)] disabled:text-[var(--text-disabled)]',
      // Outline: Transparent with gold border - elegant on dark burgundy
      outline: 'bg-transparent text-[var(--text-primary)] border-2 border-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[var(--button-text-on-gold)] disabled:bg-transparent disabled:text-[var(--text-disabled)] disabled:border-[var(--text-disabled)]',
      // Ghost: Subtle, no border - for tertiary actions
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--light-800)] hover:text-[var(--text-primary)] disabled:bg-transparent disabled:text-[var(--text-disabled)]',
    };

    // Combine all styles
    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

    // Add gold glow effect for gold variant
    const style = variant === 'gold' && !disabled
      ? { boxShadow: 'var(--glow-gold-subtle)' }
      : {};

    return (
      <button
        ref={ref}
        className={combinedClassName}
        style={style}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
