import React from 'react';
import Link from 'next/link';

interface BadgeProps {
    children: React.ReactNode;
    style?: 'default' | 'dark' | 'outline' | 'success' | 'gold' | 'blue' | 'purple';
    icon?: React.ElementType;
}

export const Badge: React.FC<BadgeProps> = ({ children, style = 'default', icon: Icon }) => {
    const styles = {
        default: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
        dark: 'bg-[var(--bg-surface-3)] text-[var(--text-primary)] border-[var(--border-strong)]',
        outline: 'bg-transparent text-[var(--text-secondary)] border-[var(--border-subtle)]',
        success: 'bg-[rgba(52,211,153,0.10)] text-[#34D399] border-[rgba(52,211,153,0.30)]',
        gold: 'bg-[var(--primary-dim)] text-[var(--primary-hover)] border-[var(--blue-border)]',
        blue: 'bg-[var(--primary-dim)] text-[var(--primary-hover)] border-[var(--blue-border)]',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[style] || styles.default}`}>
            {Icon && <Icon className="w-3 h-3 mr-1" />}
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
        primary: "btn-gold shadow-md focus:ring-[var(--border-focus)]",
        secondary: "bg-transparent hover:bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[rgba(255,255,255,0.12)] focus:ring-[var(--border-focus)]",
        outline: "bg-transparent hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] focus:ring-[var(--border-focus)]",
        ghost: "bg-transparent hover:bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] focus:ring-[var(--border-focus)]",
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

export const Input: React.FC<InputProps> = ({ label, id, type = "text", placeholder, required, value, onChange, min, max, step }) => (
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
                max={max}
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

// Toast notification component
interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    type?: 'success' | 'error' | 'info';
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    isVisible,
    onClose,
    type = 'success',
    duration = 3000
}) => {
    React.useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const typeStyles = {
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        error: 'bg-red-500/10 border-red-500/30 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    };

    const icons = {
        success: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg ${typeStyles[type]}`}>
                {icons[type]}
                <span className="text-sm font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export * from './PageHeader';
export * from './CustomScrollbar';
