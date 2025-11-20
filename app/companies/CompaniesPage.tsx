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
            <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>

                    {/* Centered Content */}
                    <div className="text-center">
                        <h1 className="mt-6 text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                            The modern way to hire <br className="hidden sm:block" />
                            <span className="text-slate-900 underline decoration-slate-300 decoration-4 underline-offset-4">Swiss tech talent</span>.
                        </h1>
                        <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
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
                    <div className="text-center p-6 rounded-2xl border border-slate-200">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Zap className="w-6 h-6 text-slate-900" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Speed to Hire</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Our candidates are active and responsive. Most companies schedule first interviews within 48 hours of access.
                        </p>
                    </div>
                    <div className="text-center p-6 rounded-2xl border border-slate-200">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Shield className="w-6 h-6 text-slate-900" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Vetted Quality</h3>
                        <p className="text-slate-500 leading-relaxed">
                            We manually review every profile. Only the top 10% of applicants make it onto the list.
                        </p>
                    </div>
                    <div className="text-center p-6 rounded-2xl border border-slate-200">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Users className="w-6 h-6 text-slate-900" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Connection</h3>
                        <p className="text-slate-500 leading-relaxed">
                            No middleman. Send interview requests directly to candidates you like with a single click.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompaniesPage;
