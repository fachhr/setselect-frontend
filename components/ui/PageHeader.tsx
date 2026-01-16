'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui';

interface PageHeaderProps {
    title: ReactNode;
    subtitle?: string;
    badge?: string;
    badgeStyle?: 'default' | 'gold' | 'success' | 'outline';
    backButton?: boolean;
    children?: ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    badge,
    badgeStyle = 'gold',
    backButton = false,
    children,
    className = ''
}) => {
    const router = useRouter();

    return (
        <div className={`bg-[var(--bg-root)] border-b border-[var(--border-subtle)] relative overflow-hidden ${className}`}>
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--gold)] opacity-5 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--blue)] opacity-5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Back Button */}
                    {backButton && (
                        <div className="absolute top-8 left-4 sm:left-8 lg:left-8">
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors group focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)] rounded-md px-1"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back
                            </button>
                        </div>
                    )}

                    {/* Badge */}
                    {badge && (
                        <div className="inline-block mb-6">
                            <Badge style={badgeStyle}>{badge}</Badge>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="mt-6 text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                        {title}
                    </h1>

                    {/* Subtitle */}
                    {subtitle && (
                        <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-light leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    {/* Children (Buttons, etc.) */}
                    {children && (
                        <div className="mt-10 flex justify-center gap-4">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
