import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- BADGE COMPONENT ---
interface BadgeProps {
    children: React.ReactNode;
    style?: 'default' | 'dark' | 'outline';
    className?: string;
}

export const Badge = ({ children, style = 'default', className }: BadgeProps) => {
    const styles = {
        default: 'bg-slate-100 text-slate-700 border-slate-200',
        dark: 'bg-slate-800 text-white border-slate-800',
        outline: 'bg-transparent text-slate-600 border-slate-300',
    };
    return (
        <span className={cn(`px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[style]}`, className)}>
            {children}
        </span>
    );
};

// --- BUTTON COMPONENT ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: React.ElementType;
}

export const Button = ({ children, variant = 'primary', className, icon: Icon, ...props }: ButtonProps) => {
    const variants = {
        primary: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus:ring-slate-500",
        // CHANGED: Removed 'shadow-sm' and changed border to 'slate-200' for a flatter, cleaner look
        secondary: "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 focus:ring-slate-500",
        outline: "bg-transparent hover:bg-slate-100 text-slate-600 border border-slate-200",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};