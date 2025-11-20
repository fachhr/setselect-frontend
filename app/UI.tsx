import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    style?: 'default' | 'dark' | 'outline' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({ children, style = 'default' }) => {
    const styles = {
        default: 'bg-slate-100 text-slate-700 border-slate-200',
        dark: 'bg-slate-800 text-white border-slate-800',
        outline: 'bg-transparent text-slate-600 border-slate-300',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[style] || styles.default}`}>
            {children}
        </span>
    );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', onClick, icon: Icon, type = 'button', disabled = false }) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus:ring-slate-500",
        secondary: "bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm focus:ring-slate-500",
        outline: "bg-transparent hover:bg-slate-100 text-slate-600 border border-slate-200",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    };

    return (
        <button type={type} disabled={disabled} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, type = "text", placeholder, required, value, onChange, min, step }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
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
                className="block w-full rounded-lg border-slate-300 bg-slate-50 border p-2.5 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:ring-slate-900 transition-colors"
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
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            rows={rows}
            required={required}
            className="block w-full rounded-lg border-slate-300 bg-slate-50 border p-2.5 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:ring-slate-900 transition-colors resize-none"
            placeholder={placeholder}
        />
    </div>
);