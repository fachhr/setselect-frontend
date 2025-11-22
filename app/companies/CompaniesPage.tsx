'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Zap, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui';

const CompaniesPage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Page Header - Centered Hero Style */}
            <div className="bg-[var(--bg-root)] border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>

                    {/* Centered Content */}
                    <div className="text-center">
                        <h1 className="mt-6 text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                            The modern way to hire <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold)] to-[var(--text-secondary)]">Swiss tech talent</span>.
                        </h1>
                        <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-light leading-relaxed">
                            Stop sifting through hundreds of irrelevant CVs. Get direct access to a curated list of pre-vetted engineers, developers, and product managers looking for their next role in Switzerland.
                        </p>
                        <div className="mt-10 flex justify-center gap-4">
                            <Button variant="primary" icon={ArrowRight} onClick={() => router.push('/contact')}>Start Hiring</Button>
                            <Button variant="outline" onClick={() => window.open('mailto:sales@silviaslist.com')}>Contact Sales</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="glass-panel text-center p-6 rounded-2xl">
                        <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-subtle)] text-[var(--gold)]">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Speed to Hire</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            Our candidates are active and responsive. Most companies schedule first interviews within 48 hours of access.
                        </p>
                    </div>
                    <div className="glass-panel text-center p-6 rounded-2xl">
                        <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-subtle)] text-[var(--gold)]">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Vetted Quality</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            We manually review every profile. Only the top 10% of applicants make it onto the list.
                        </p>
                    </div>
                    <div className="glass-panel text-center p-6 rounded-2xl">
                        <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-subtle)] text-[var(--gold)]">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Direct Connection</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            No middleman. Send interview requests directly to candidates you like with a single click.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompaniesPage;
