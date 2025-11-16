import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'white' | 'solid' | 'outline' | 'ghost';
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

    // Variant styles - Burgundy & White Only
    const variantStyles = {
      // PRIMARY: Bright Burgundy CTA - Rich burgundy with white text
      primary: 'bg-[var(--primary)] text-white shadow-lg hover:bg-[var(--primary-light)] hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-[var(--light-400)] disabled:text-[var(--text-disabled)] disabled:shadow-none disabled:transform-none',
      // WHITE: Pure White CTA - White with burgundy text (high contrast)
      white: 'bg-[var(--accent-white)] text-[var(--button-text-on-white)] shadow-lg hover:bg-[var(--accent-white-hover)] border-2 border-[var(--accent-white)] transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-[var(--light-400)] disabled:text-[var(--text-disabled)] disabled:shadow-none disabled:transform-none',
      // SECONDARY: Light card with border - Alternative actions
      secondary: 'bg-[var(--surface-1)] text-[var(--text-primary)] border-2 border-[var(--light-400)] shadow-sm hover:bg-[var(--surface-2)] hover:border-[var(--primary)] hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-[var(--light-600)] disabled:text-[var(--text-disabled)] disabled:border-[var(--light-400)] disabled:shadow-none disabled:transform-none',
      // SOLID: Light background
      solid: 'bg-[var(--light-800)] text-[var(--text-primary)] shadow hover:bg-[var(--light-600)] disabled:bg-[var(--light-600)] disabled:text-[var(--text-disabled)]',
      // OUTLINE: Transparent with burgundy border
      outline: 'bg-transparent text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white disabled:bg-transparent disabled:text-[var(--text-disabled)] disabled:border-[var(--text-disabled)]',
      // GHOST: Subtle, no border - for tertiary actions
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--light-800)] hover:text-[var(--text-primary)] disabled:bg-transparent disabled:text-[var(--text-disabled)]',
    };

    // Combine all styles
    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

    // Add burgundy glow effect for primary variant
    const style = variant === 'primary' && !disabled
      ? { boxShadow: 'var(--glow-burgundy-subtle)' }
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
