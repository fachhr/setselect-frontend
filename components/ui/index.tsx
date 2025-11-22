import React from 'react';
import Link from 'next/link';

interface BadgeProps {
    children: React.ReactNode;
    style?: 'default' | 'dark' | 'outline' | 'success' | 'gold' | 'blue';
}

export const Badge: React.FC<BadgeProps> = ({ children, style = 'default' }) => {
    const styles = {
        default: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
        dark: 'bg-[var(--bg-surface-3)] text-[var(--text-primary)] border-[var(--border-strong)]',
        outline: 'bg-transparent text-[var(--text-secondary)] border-[var(--border-subtle)]',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        gold: 'bg-[var(--gold-dim)] text-[var(--gold)] border-[var(--gold-border)]',
        blue: 'bg-[var(--blue-dim)] text-[var(--blue)] border-[rgba(59,130,246,0.3)]',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[style] || styles.default}`}>
            {children}
        </span>
    );
};

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: React.ElementType;
    href?: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    onClick,
    icon: Icon,
    type = 'button',
    disabled = false,
    href
}) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-root)] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "btn-gold shadow-lg shadow-[rgba(212,175,55,0.1)] focus:ring-[rgba(212,175,55,0.5)]",
        secondary: "bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-strong)] focus:ring-[rgba(59,130,246,0.5)]",
        outline: "bg-transparent hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)] focus:ring-[rgba(59,130,246,0.5)]",
        ghost: "bg-transparent hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:ring-[rgba(59,130,246,0.5)]",
    };

    const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`;
    const content = (
        <>
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={combinedClassName} onClick={onClick}>
                {content}
            </Link>
        );
    }

    return (
        <button type={type} disabled={disabled} onClick={onClick} className={combinedClassName}>
            {content}
        </button>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, type = "text", placeholder, required, value, onChange, min, step }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)]">
            {label} {required && <span className="text-[var(--error)]">*</span>}
        </label>
        <div className="relative">
            <input
                type={type}
                id={id}
                value={value}
                onChange={onChange}
                required={required}
                min={min}
                step={step}
                className="input-base block w-full rounded-lg p-3 text-sm placeholder-[var(--text-tertiary)]"
                placeholder={placeholder}
            />
        </div>
    </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, placeholder, required, value, onChange, rows = 4 }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)]">
            {label} {required && <span className="text-[var(--error)]">*</span>}
        </label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            rows={rows}
            required={required}
            className="input-base block w-full rounded-lg p-3 text-sm placeholder-[var(--text-tertiary)] resize-none"
            placeholder={placeholder}
        />
    </div>
);
