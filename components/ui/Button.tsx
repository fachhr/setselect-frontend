import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'solid' | 'outline' | 'ghost';
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

    // Variant styles
    const variantStyles = {
      // Primary: Bright yellow with dark text - maximum visibility
      primary: 'bg-[var(--primary)] text-[var(--button-text-on-primary)] shadow-md hover:bg-[var(--primary-dark)] hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-[var(--light-600)] disabled:text-[var(--dark-400)] disabled:shadow-none disabled:transform-none',
      // Secondary: White with border and dark text - great contrast on colored backgrounds
      secondary: 'bg-white text-[var(--dark-800)] border-2 border-[var(--dark-800)] shadow-sm hover:bg-[var(--light-800)] hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-[var(--light-600)] disabled:text-[var(--dark-400)] disabled:border-[var(--light-400)] disabled:shadow-none disabled:transform-none',
      // Solid: Light gray with dark text - subtle but visible
      solid: 'bg-[var(--light-800)] text-[var(--dark-800)] shadow hover:bg-[var(--light-600)] disabled:bg-[var(--light-600)] disabled:text-[var(--dark-400)]',
      // Outline: Transparent with strong border - works on any background
      outline: 'bg-transparent text-[var(--dark-800)] border-2 border-[var(--dark-800)] hover:bg-[var(--dark-800)] hover:text-white disabled:bg-transparent disabled:text-[var(--dark-400)] disabled:border-[var(--dark-400)]',
      // Ghost: Subtle, no border - for tertiary actions
      ghost: 'bg-transparent text-[var(--dark-600)] hover:bg-[var(--light-600)] hover:text-[var(--foreground)] disabled:bg-transparent disabled:text-[var(--dark-400)]',
    };

    // Combine all styles
    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

    return (
      <button
        ref={ref}
        className={combinedClassName}
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
