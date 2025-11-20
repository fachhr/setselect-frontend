'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button - Top Left */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>

                    {/* Centered Title */}
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">Terms of Service</h1>
                        <p className="mt-4 text-lg text-slate-500">Legal agreements that govern the use of our platform.</p>
                    </div>
                </div>
            </div>

            {/* Main Content Card - No Shadow, Flat Border */}
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12">
                    <div className="space-y-8 text-slate-600 leading-relaxed">
                        <p className="text-lg font-medium text-slate-900">
                            Welcome to Silvia&apos;s List. Please read these terms carefully before using our platform to find talent or opportunities.
                        </p>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. The Platform</h2>
                            <p>
                                Silvia&apos;s List connects top tech talent (&ldquo;Candidates&rdquo;) with companies (&ldquo;Employers&rdquo;) in Switzerland. We facilitate introductions but are not a party to any employment contracts formed between Users. By using our service, you acknowledge that we act solely as a matching platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. For Candidates</h2>
                            <ul className="list-disc list-outside ml-5 space-y-2">
                                <li><strong>Anonymity:</strong> Your profile remains anonymized until you explicitly approve an introduction request. We value your privacy and current employment status.</li>
                                <li><strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during the registration process. Misrepresentation of skills or experience may result in removal from the platform.</li>
                                <li><strong>Consent:</strong> By submitting your profile, you grant us permission to display anonymized versions of your data to prospective employers.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. For Employers</h2>
                            <ul className="list-disc list-outside ml-5 space-y-2">
                                <li><strong>Usage:</strong> You agree to use Candidate information solely for the purpose of recruitment. Solicitation for other services is strictly prohibited.</li>
                                <li><strong>Confidentiality:</strong> You must maintain the confidentiality of any Candidate information revealed to you during the introduction process.</li>
                                <li><strong>Fees:</strong> Access to the list is free. Success fees apply only upon successful hiring of a Candidate, as detailed in our separate Service Agreement signed upon account creation.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Privacy</h2>
                            <p>
                                We process personal data in accordance with the Swiss Federal Data Protection Act (FADP) and GDPR. We do not sell your data to third parties. See our Privacy Policy for full details on data retention and deletion rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Limitation of Liability</h2>
                            <p>
                                Silvia&apos;s List is provided &ldquo;as is&rdquo;. We verify candidates to the best of our ability but do not guarantee the accuracy of candidate profiles or the suitability of any candidate for a specific role.
                            </p>
                        </section>

                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <p className="text-sm text-slate-400">
                                Last updated: November 19, 2025 <br />
                                Contact: legal@silviaslist.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
