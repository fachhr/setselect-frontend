'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Upload,
    FileText,
    CheckCircle,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { CANTONS, NOTICE_PERIOD_OPTIONS, COUNTRY_CODES } from '@/lib/constants';
import { LANGUAGE_PROFICIENCY_OPTIONS } from '@/lib/formOptions';

const JoinForm: React.FC = () => {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: CV, 2: Details, 3: Success
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locationsTouched, setLocationsTouched] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State (matching backend schema)
    const [formData, setFormData] = useState({
        contact_first_name: '',
        contact_last_name: '',
        email: '',
        linkedinUrl: '',
        country_code: '',
        phoneNumber: '',
        years_of_experience: '',
        notice_period_months: '',
        desired_locations: [] as string[],
        desired_other_location: '',
        salary_min: '',
        salary_max: '',
        // Language proficiency
        base_languages: [
            { language: 'English', proficiency: '' },
            { language: 'German', proficiency: '' },
            { language: 'French', proficiency: '' },
            { language: 'Italian', proficiency: '' },
        ] as { language: string; proficiency: string }[],
        showOtherLanguage: false,
        otherLanguageName: '',
        otherLanguageProficiency: '',
        accepted_terms: false
    });

    // Validation Logic
    const salaryMinNum = Number(formData.salary_min);
    const salaryMaxNum = Number(formData.salary_max);
    const hasSalaryError = formData.salary_min !== '' && formData.salary_max !== '' && salaryMaxNum < salaryMinNum;

    // LinkedIn Validation: Optional, but if provided must contain 'linkedin.com'
    const hasLinkedinError = formData.linkedinUrl.length > 0 && !formData.linkedinUrl.includes('linkedin.com');

    // Location Validation: Must have at least 1 selected
    const hasLocationError = formData.desired_locations.length === 0;

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark locations as touched to show validation errors
        setLocationsTouched(true);

        // Validation checks
        if (hasSalaryError || hasLocationError) return;
        if (!file) {
            alert('Please upload your CV');
            return;
        }
        if (!formData.accepted_terms) {
            alert('Please accept the terms and conditions');
            return;
        }

        setIsSubmitting(true);

        try {
            // STEP 1: Upload CV
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const uploadResponse = await fetch('/api/talent-pool/upload-cv', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || 'Failed to upload CV');
            }

            const { cvStoragePath, originalFilename } = await uploadResponse.json();

            // Process languages: filter out empty proficiencies, add "Other" if filled
            const processedLanguages = [
                ...formData.base_languages.filter(lang =>
                    lang.proficiency && lang.proficiency !== '' && lang.proficiency !== 'None'
                ),
                ...(formData.showOtherLanguage &&
                    formData.otherLanguageName.trim() &&
                    formData.otherLanguageProficiency &&
                    formData.otherLanguageProficiency !== '' &&
                    formData.otherLanguageProficiency !== 'None'
                    ? [{ language: formData.otherLanguageName.trim(), proficiency: formData.otherLanguageProficiency }]
                    : []
                )
            ];

            // STEP 2: Submit Profile
            const profileData = {
                contact_first_name: formData.contact_first_name,
                contact_last_name: formData.contact_last_name,
                email: formData.email,
                linkedinUrl: (formData.linkedinUrl && !formData.linkedinUrl.match(/^https?:\/\//))
                    ? `https://${formData.linkedinUrl}`
                    : (formData.linkedinUrl || undefined),
                country_code: formData.country_code,
                phoneNumber: formData.phoneNumber,
                years_of_experience: parseInt(formData.years_of_experience),
                notice_period_months: formData.notice_period_months,
                desired_locations: formData.desired_locations,
                desired_other_location: formData.desired_other_location || undefined,
                salary_min: parseInt(formData.salary_min),
                salary_max: parseInt(formData.salary_max),
                base_languages: processedLanguages.length > 0 ? processedLanguages : null,
                cvStoragePath,
                originalFilename,
                accepted_terms: formData.accepted_terms,
            };

            const submitResponse = await fetch('/api/talent-pool/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            if (!submitResponse.ok) {
                const errorData = await submitResponse.json();
                throw new Error(errorData.error || 'Failed to submit profile');
            }

            // STEP 3: Show success
            setStep(3);

        } catch (error) {
            console.error('Submission error:', error);
            alert(error instanceof Error ? error.message : 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to format currency for display
    const formatCurrency = (val: string | number) => {
        if (!val) return '';
        return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumSignificantDigits: 3 }).format(Number(val));
    };

    if (step === 3) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
                <div className="glass-panel max-w-2xl mx-auto pt-12 pb-24 px-4 text-center rounded-2xl">
                    <div className="w-16 h-16 bg-[var(--gold)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle className="w-8 h-8 text-[#0A1628]" />
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Application Received</h2>
                    <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto text-lg">
                        We&apos;ve received your profile. Our team will review your anonymized data and match you with leading oil & gas companies within 48 hours.
                    </p>
                    <div className="bg-[var(--bg-surface-2)] rounded-xl p-6 border border-[var(--border-subtle)] max-w-md mx-auto mb-8">
                        <h3 className="font-medium text-[var(--text-primary)] mb-2">What happens next?</h3>
                        <ul className="text-sm text-[var(--text-secondary)] space-y-2 text-left">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-1.5"></div>We verify your skills and experience</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-1.5"></div>Your anonymized profile goes live</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-1.5"></div>Companies request to meet you</li>
                        </ul>
                    </div>
                    <Button onClick={() => router.push('/')} icon={ArrowLeft}>Back to Candidates</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors group focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.5)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)] rounded-md px-1"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">Join Silvia&apos;s List</h1>
                        <p className="mt-4 text-lg text-[var(--text-secondary)]">Create your profile and connect with top oil & gas opportunities in Switzerland.</p>
                    </div>
                </div>
            </div>

            {/* Main Form Content - No Shadow Card */}
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="glass-panel rounded-2xl overflow-hidden p-8 space-y-10 md:p-12">

                    {/* SECTION 1: CV UPLOAD */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-[var(--gold)] text-[#0A1628] text-xs flex items-center justify-center font-bold">1</div>
                                Upload CV
                            </h2>
                            {file && <Badge style="success">File Selected</Badge>}
                        </div>

                        <div
                            className={`
                relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ease-in-out cursor-pointer
                ${isDragging ? 'border-[var(--blue)] bg-[var(--bg-surface-2)]' : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-2)]'}
                ${file ? 'bg-[var(--bg-surface-2)] border-[var(--border-strong)]' : ''}
                focus-within:ring-2 focus-within:ring-[rgba(59,130,246,0.5)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg-root)]
              `}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                            aria-label="Upload CV file"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileSelect}
                            />

                            {file ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-12 h-12 bg-[var(--bg-surface-1)] rounded-lg shadow-sm border border-[var(--border-subtle)] flex items-center justify-center mb-3">
                                        <FileText className="w-6 h-6 text-[var(--text-primary)]" />
                                    </div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="mt-4 text-xs text-red-500 hover:text-red-700 font-medium underline"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="cursor-pointer">
                                    <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                        {isDragging ? 'Drop your CV here' : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-2">PDF or DOCX (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="h-px bg-[var(--bg-surface-2)]"></div>

                    {/* SECTION 2: PERSONAL DETAILS */}
                    <section>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-[var(--gold)] text-[#0A1628] text-xs flex items-center justify-center">2</div>
                            Personal Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="First Name" id="contact_first_name" required
                                placeholder="Sarah"
                                value={formData.contact_first_name} onChange={e => setFormData({ ...formData, contact_first_name: e.target.value })}
                            />
                            <Input
                                label="Last Name" id="contact_last_name" required
                                placeholder="Miller"
                                value={formData.contact_last_name} onChange={e => setFormData({ ...formData, contact_last_name: e.target.value })}
                            />
                            <div className="md:col-span-2">
                                <Input
                                    label="Email Address" id="email" type="email" placeholder="you@company.com" required
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    LinkedIn URL <span className="text-[var(--text-tertiary)] text-xs font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        className={`block w-full rounded-lg border bg-[var(--bg-surface-2)] p-2.5 text-sm text-[var(--text-primary)] focus:ring-[var(--blue)] transition-colors ${hasLinkedinError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[var(--border-strong)] focus:border-[var(--blue)]'
                                            }`}
                                        placeholder="linkedin.com/in/..."
                                        value={formData.linkedinUrl}
                                        onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                        onBlur={() => {
                                            if (formData.linkedinUrl && !formData.linkedinUrl.match(/^https?:\/\//)) {
                                                setFormData({ ...formData, linkedinUrl: `https://${formData.linkedinUrl}` });
                                            }
                                        }}
                                    />
                                </div>
                                {hasLinkedinError && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">Please enter a valid LinkedIn profile URL.</span>
                                    </div>
                                )}
                            </div>

                            {/* PHONE SECTION */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <select
                                            id="country_code"
                                            required
                                            value={formData.country_code}
                                            onChange={e => setFormData({ ...formData, country_code: e.target.value })}
                                            className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)]"
                                        >
                                            <option value="">Code</option>
                                            {COUNTRY_CODES.map(country => (
                                                <option key={country.code} value={country.dialCode}>
                                                    {country.flag} {country.dialCode}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2 relative">
                                        <input
                                            type="tel"
                                            required
                                            className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)]"
                                            placeholder="79 000 00 00"
                                            value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>

                    <div className="h-px bg-[var(--bg-surface-2)]"></div>

                    {/* SECTION 3: EXPERIENCE */}
                    <section>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-[var(--gold)] text-[#0A1628] text-xs flex items-center justify-center">3</div>
                            Experience
                        </h2>

                        <div className="space-y-6">
                            <Input
                                label="Years of Relevant Experience" id="years_of_experience" type="number" placeholder="e.g. 5" required min="0" max="50"
                                value={formData.years_of_experience} onChange={e => setFormData({ ...formData, years_of_experience: e.target.value })}
                            />

                            {/* Languages subsection */}
                            <div className="pt-4">
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                                    Languages
                                </label>
                                <p className="text-xs text-[var(--text-tertiary)] mb-4">
                                    Select your proficiency level for each language you speak.
                                </p>

                                <div className="space-y-3">
                                    {/* Standard Languages */}
                                    {formData.base_languages.map((lang, index) => (
                                        <div key={lang.language} className="grid grid-cols-2 gap-4 items-center">
                                            <span className="text-sm text-[var(--text-secondary)]">
                                                {lang.language}
                                            </span>
                                            <select
                                                value={lang.proficiency}
                                                onChange={(e) => {
                                                    const updated = [...formData.base_languages];
                                                    updated[index] = { ...updated[index], proficiency: e.target.value };
                                                    setFormData({ ...formData, base_languages: updated });
                                                }}
                                                className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)]"
                                            >
                                                {LANGUAGE_PROFICIENCY_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}

                                    {/* Other Language Toggle */}
                                    {!formData.showOtherLanguage ? (
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, showOtherLanguage: true })}
                                            className="text-sm text-[var(--gold)] hover:text-[var(--text-primary)] transition-colors font-medium mt-2"
                                        >
                                            + Add another language
                                        </button>
                                    ) : (
                                        <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)] mt-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[var(--text-secondary)]">
                                                    Other
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        showOtherLanguage: false,
                                                        otherLanguageName: '',
                                                        otherLanguageProficiency: ''
                                                    })}
                                                    className="text-xs text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Spanish"
                                                    value={formData.otherLanguageName}
                                                    onChange={(e) => setFormData({ ...formData, otherLanguageName: e.target.value })}
                                                    className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)] placeholder-[var(--text-tertiary)]"
                                                />
                                                <select
                                                    value={formData.otherLanguageProficiency}
                                                    onChange={(e) => setFormData({ ...formData, otherLanguageProficiency: e.target.value })}
                                                    className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)]"
                                                >
                                                    {LANGUAGE_PROFICIENCY_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-[var(--bg-surface-2)]"></div>

                    {/* SECTION 4: JOB PREFERENCES */}
                    <section>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-[var(--gold)] text-[#0A1628] text-xs flex items-center justify-center">4</div>
                            Job Preferences
                        </h2>

                        <div className="space-y-6">

                            {/* Notice Period */}
                            <div>
                                <label htmlFor="notice_period_months" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    Notice Period <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="notice_period_months"
                                    required
                                    value={formData.notice_period_months}
                                    onChange={e => setFormData({ ...formData, notice_period_months: e.target.value })}
                                    className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)]"
                                >
                                    <option value="">Select...</option>
                                    {NOTICE_PERIOD_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Salary Expectation */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    Yearly Salary Expectation (CHF) <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Min (e.g. 120000)"
                                            min="0" step="1000"
                                            required
                                            className={`block w-full rounded-lg border bg-[var(--bg-surface-2)] p-2.5 text-sm text-[var(--text-primary)] focus:ring-[var(--blue)] transition-colors ${hasSalaryError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[var(--border-strong)] focus:border-[var(--blue)]'
                                                }`}
                                            value={formData.salary_min}
                                            onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Max (e.g. 150000)"
                                            min="0" step="1000"
                                            required
                                            className={`block w-full rounded-lg border bg-[var(--bg-surface-2)] p-2.5 text-sm text-[var(--text-primary)] focus:ring-[var(--blue)] transition-colors ${hasSalaryError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[var(--border-strong)] focus:border-[var(--blue)]'
                                                }`}
                                            value={formData.salary_max}
                                            onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {/* Validation Error */}
                                {hasSalaryError && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">Maximum salary cannot be lower than minimum salary.</span>
                                    </div>
                                )}
                                {/* Range Helper Text (Only show if no error) */}
                                {!hasSalaryError && formData.salary_min && formData.salary_max && (
                                    <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                                        Range: <span className="font-mono font-semibold text-[var(--text-primary)]">{formatCurrency(formData.salary_min)} – {formatCurrency(formData.salary_max)}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Preferred Locations (Max 5)</label>
                                <div className="flex flex-wrap gap-2">
                                    {CANTONS.map(canton => (
                                        <label
                                            key={canton.code}
                                            className={`
                        cursor-pointer px-3 py-1.5 text-xs font-medium rounded border transition-all select-none
                        has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[rgba(59,130,246,0.5)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--bg-root)]
                        ${formData.desired_locations.includes(canton.code)
                                                    ? 'bg-[var(--gold)] border-[var(--blue)] text-[#0A1628] shadow-md'
                                                    : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'}
                        ${!formData.desired_locations.includes(canton.code) && formData.desired_locations.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                                        >
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.desired_locations.includes(canton.code)}
                                                disabled={!formData.desired_locations.includes(canton.code) && formData.desired_locations.length >= 5}
                                                onChange={() => {
                                                    setLocationsTouched(true);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        desired_locations: prev.desired_locations.includes(canton.code)
                                                            ? prev.desired_locations.filter(l => l !== canton.code)
                                                            : prev.desired_locations.length < 5 ? [...prev.desired_locations, canton.code] : prev.desired_locations
                                                    }))
                                                }}
                                            />
                                            {canton.name}
                                        </label>
                                    ))}
                                </div>
                                {formData.desired_locations.length > 0 ? (
                                    <p className="text-xs text-[var(--text-tertiary)] mt-2">
                                        {formData.desired_locations.length}/5 selected
                                    </p>
                                ) : locationsTouched ? (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">At least one location must be selected.</span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Other Location (Optional) */}
                            <Input
                                label="Other Preferred Location (Optional)"
                                id="desired_other_location"
                                placeholder="e.g., Remote, Berlin, Paris"
                                value={formData.desired_other_location}
                                onChange={e => setFormData({ ...formData, desired_other_location: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* SUBMIT */}
                    <div className="pt-4">
                        <div className="flex items-start gap-3 mb-6 bg-[var(--bg-surface-2)] p-4 rounded-lg border border-[var(--border-subtle)]">
                            <input
                                type="checkbox"
                                id="accepted_terms"
                                required
                                checked={formData.accepted_terms}
                                onChange={(e) => setFormData({ ...formData, accepted_terms: e.target.checked })}
                                className="checkbox-slate mt-1"
                            />
                            <label htmlFor="accepted_terms" className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                                I agree to the <button type="button" onClick={() => router.push('/terms')} className="underline text-[var(--text-primary)] hover:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.5)] focus:ring-offset-1 focus:ring-offset-[var(--bg-surface-2)] rounded">Terms of Service</button> and Privacy Policy. I understand that my profile will be anonymized and my contact details will only be shared with companies I explicitly approve.
                            </label>
                        </div>
                        <Button type="submit" className="w-full py-3 text-base" disabled={!file || hasSalaryError || hasLocationError || isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default JoinForm;
