'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';


const ContactPage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Page Header - Centered Hero Style */}
            <div className="bg-[var(--bg-root)] border-b border-[var(--border-subtle)] relative overflow-hidden">
                {/* Ambient gradient orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--secondary)] opacity-[0.08] blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary)] opacity-[0.06] blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors group focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)] rounded-md px-1"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>
                    <div className="text-center">
                        <h1 className="font-title mt-6 text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">Touch</span></h1>
                        <p className="mt-4 text-lg text-[var(--text-secondary)]">Have a question about hiring, joining, or partnership?</p>
                    </div>
                </div>
            </div>

            {/* Main Contact Content */}
            <div className="max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="glass-panel rounded-2xl overflow-hidden p-8 md:p-10 space-y-8">
                    <div>
                        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Email</h3>
                        <a href="mailto:hello@setberry.com" className="text-[var(--text-secondary)] hover:text-[var(--gold)] flex items-center gap-2 transition-colors">
                            <Mail className="w-4 h-4" /> hello@setberry.com
                        </a>
                    </div>

                    <div className="p-4 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
                        <h4 className="font-medium text-[var(--text-primary)] mb-1">For Companies</h4>
                        <p className="text-xs text-[var(--text-tertiary)] mb-3">Looking to hire instantly? Skip the queue.</p>
                        <a href="mailto:hello@setberry.com" className="text-xs font-bold text-[var(--gold)] hover:underline">Email Sales Team →</a>
                    </div>
                </div>

                {/* TODO: Re-enable contact form once Resend API key is configured.
                    The form component and /api/contact route are ready — just
                    uncomment this block and restore the grid layout + imports. */}
            </div>
        </div>
    );
};

export default ContactPage;
