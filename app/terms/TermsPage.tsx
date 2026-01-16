'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="bg-[var(--bg-root)] border-b border-[var(--border-subtle)] relative overflow-hidden">
                {/* Ambient gradient orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--secondary)] opacity-[0.08] blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary)] opacity-[0.06] blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
                    {/* Back Button - Top Left */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>

                    {/* Centered Title */}
                    <div className="text-center">
                        <h1 className="font-title text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">Service</span></h1>
                        <p className="mt-4 text-lg text-[var(--text-secondary)]">Legal agreements that govern the use of our platform.</p>
                    </div>
                </div>
            </div>

            {/* Main Content Card - No Shadow, Flat Border */}
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="glass-panel rounded-2xl p-8 md:p-12">
                    <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
                        <p className="text-lg font-medium text-[var(--text-primary)]">
                            Welcome to SetSelect. Please read these terms carefully before using our platform to find energy & commodities talent or opportunities.
                        </p>

                        <section>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">1. The Platform</h2>
                            <p>
                                SetSelect connects top energy & commodities talent (&ldquo;Candidates&rdquo;) with companies (&ldquo;Employers&rdquo;) in Switzerland. We facilitate introductions but are not a party to any employment contracts formed between Users. By using our service, you acknowledge that we act solely as a matching platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">2. For Candidates</h2>
                            <ul className="list-disc list-outside ml-5 space-y-2">
                                <li><strong className="text-[var(--text-primary)]">Anonymity:</strong> Your profile remains anonymized until you explicitly approve an introduction request. We value your privacy and current employment status.</li>
                                <li><strong className="text-[var(--text-primary)]">Accuracy:</strong> You agree to provide accurate, current, and complete information during the registration process. Misrepresentation of skills or experience may result in removal from the platform.</li>
                                <li><strong className="text-[var(--text-primary)]">Consent:</strong> By submitting your profile, you grant us permission to display anonymized versions of your data to prospective employers.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">3. For Employers</h2>
                            <ul className="list-disc list-outside ml-5 space-y-2">
                                <li><strong className="text-[var(--text-primary)]">Usage:</strong> You agree to use Candidate information solely for the purpose of recruitment. Solicitation for other services is strictly prohibited.</li>
                                <li><strong className="text-[var(--text-primary)]">Confidentiality:</strong> You must maintain the confidentiality of any Candidate information revealed to you during the introduction process.</li>
                                <li><strong className="text-[var(--text-primary)]">Fees:</strong> Access to the list is free. Success fees apply only upon successful hiring of a Candidate, as detailed in our separate Service Agreement signed upon account creation.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">4. Data Privacy</h2>
                            <p>
                                We process personal data in accordance with the Swiss Federal Data Protection Act (FADP) and GDPR. We do not sell your data to third parties. See our Privacy Policy for full details on data retention and deletion rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">5. Limitation of Liability</h2>
                            <p>
                                SetSelect is provided &ldquo;as is&rdquo;. We verify candidates to the best of our ability but do not guarantee the accuracy of candidate profiles or the suitability of any candidate for a specific role.
                            </p>
                        </section>

                        <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
                            <p className="text-sm text-[var(--text-tertiary)]">
                                Last updated: November 19, 2025 <br />
                                Contact: legal@setselect.io
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
