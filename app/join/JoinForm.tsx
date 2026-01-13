'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Upload,
    FileText,
    CheckCircle,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { WORK_LOCATIONS, NOTICE_PERIOD_OPTIONS, COUNTRY_CODES, WORK_ELIGIBILITY_OPTIONS, LANGUAGE_OPTIONS, FUNCTIONAL_EXPERTISE_OPTIONS, type FunctionalExpertise } from '@/lib/formOptions';
import { talentPoolSchemaRefined, type TalentPoolFormData } from '@/lib/validation/talentPoolSchema';

// Helper for parsing non-JSON error responses
const safeJsonParse = async (response: Response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(text || `Server error (${response.status})`);
    }
};

const JoinForm: React.FC = () => {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: CV, 2: Details, 3: Success
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // UI state for showing/hiding the "Other" language input
    const [showOtherLanguage, setShowOtherLanguage] = useState(false);

    // React Hook Form with Zod validation
    const {
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors, isSubmitting }
    } = useForm<TalentPoolFormData>({
        resolver: zodResolver(talentPoolSchemaRefined),
        mode: 'onBlur', // Validate on blur for better UX
        defaultValues: {
            contact_first_name: '',
            contact_last_name: '',
            email: '',
            linkedinUrl: '',
            country_code: '',
            phoneNumber: '',
            years_of_experience: 0,
            work_eligibility: undefined,
            desired_roles: '',
            notice_period_months: undefined,
            desired_locations: [],
            desired_other_location: '',
            salary_min: null,
            salary_max: null,
            languages: [],
            other_language: '',
            highlight: '',
            functional_expertise: [],
            other_expertise: '',
            accepted_terms: false as unknown as true, // Will be validated on submit
        }
    });

    // Watch values for conditional rendering
    const cvFile = watch('cvFile');
    const desiredLocations = watch('desired_locations') as TalentPoolFormData['desired_locations'] | undefined;
    const linkedinUrl = watch('linkedinUrl');
    const salaryMin = watch('salary_min');
    const salaryMax = watch('salary_max');
    const languages = watch('languages');
    const otherLanguage = watch('other_language');
    const acceptedTerms = watch('accepted_terms');
    const functionalExpertise = watch('functional_expertise') as TalentPoolFormData['functional_expertise'] | undefined;
    const showOtherExpertise = functionalExpertise?.includes('Other');

    // File handlers with Zod validation
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            setValue('cvFile', droppedFile, { shouldValidate: true });
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setValue('cvFile', selectedFile, { shouldValidate: true });
        }
    };

    const handleRemoveFile = () => {
        setValue('cvFile', undefined as unknown as File, { shouldValidate: false });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Form submission handler (called by react-hook-form after validation passes)
    const onSubmit = async (data: TalentPoolFormData) => {
        try {
            // STEP 1: Upload CV
            const uploadFormData = new FormData();
            uploadFormData.append('file', data.cvFile);

            const uploadResponse = await fetch('/api/talent-pool/upload-cv', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!uploadResponse.ok) {
                const errorData = await safeJsonParse(uploadResponse);
                throw new Error(errorData.error || 'Failed to upload CV');
            }

            const { cvStoragePath, originalFilename } = await uploadResponse.json();

            // Process languages: include base selections + split "Other" by semicolon
            const baseLanguages = data.languages || [];
            const otherLanguages = data.other_language?.trim()
                ? data.other_language.split(';').map(l => l.trim()).filter(l => l.length > 0)
                : [];

            // Deduplicate (case-insensitive), preserving first occurrence
            const seen = new Set<string>();
            const processedLanguages: string[] = [];
            for (const lang of [...baseLanguages, ...otherLanguages]) {
                const lower = lang.toLowerCase();
                if (!seen.has(lower)) {
                    seen.add(lower);
                    processedLanguages.push(lang);
                }
            }

            // STEP 2: Submit Profile
            const profileData = {
                contact_first_name: data.contact_first_name,
                contact_last_name: data.contact_last_name,
                email: data.email,
                linkedinUrl: (data.linkedinUrl && !data.linkedinUrl.match(/^https?:\/\//))
                    ? `https://${data.linkedinUrl}`
                    : (data.linkedinUrl || undefined),
                country_code: data.country_code,
                phoneNumber: data.phoneNumber,
                years_of_experience: data.years_of_experience,
                work_eligibility: data.work_eligibility,
                desired_roles: data.desired_roles,
                notice_period_months: data.notice_period_months,
                desired_locations: data.desired_locations,
                desired_other_location: data.desired_other_location || undefined,
                salary_min: data.salary_min,
                salary_max: data.salary_max,
                languages: processedLanguages.length > 0 ? processedLanguages : null,
                highlight: data.highlight || undefined,
                functional_expertise: data.functional_expertise,
                other_expertise: data.other_expertise || undefined,
                cvStoragePath,
                originalFilename,
                accepted_terms: data.accepted_terms,
            };

            const submitResponse = await fetch('/api/talent-pool/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            if (!submitResponse.ok) {
                const errorData = await safeJsonParse(submitResponse);
                throw new Error(errorData.error || 'Failed to submit profile');
            }

            // STEP 3: Show success
            setStep(3);

        } catch (error) {
            console.error('Submission error:', error);
            alert(error instanceof Error ? error.message : 'An error occurred. Please try again.');
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
                        <CheckCircle className="w-8 h-8 text-[var(--bg-root)]" />
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">You&apos;re In</h2>
                    <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto text-lg">
                        Your profile is now with our team. We personally review every application to match top talent with the right opportunities in Switzerland&apos;s oil & gas sector.
                    </p>
                    <div className="bg-[var(--bg-surface-2)] rounded-xl p-6 border border-[var(--border-subtle)] max-w-md mx-auto mb-8">
                        <h3 className="font-medium text-[var(--text-primary)] mb-2">What happens next?</h3>
                        <ul className="text-sm text-[var(--text-secondary)] space-y-2 text-left">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-1.5"></div>Our team reviews your experience and preferences</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-1.5"></div>We identify companies that align with your goals</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-1.5"></div>We introduce you directly when there&apos;s a strong fit</li>
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
                        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">Join Set<span className="font-light text-[var(--text-secondary)]">Select</span></h1>
                        <p className="mt-4 text-lg text-[var(--text-secondary)]">Create your profile and connect with top oil & gas opportunities in Switzerland.</p>
                    </div>
                </div>
            </div>

            {/* Main Form Content - No Shadow Card */}
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                        // Prevent Enter key from submitting the form unless focused on submit button
                        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).getAttribute('type') !== 'submit') {
                            e.preventDefault();
                        }
                    }}
                    className="glass-panel rounded-2xl overflow-hidden p-8 space-y-10 md:p-12"
                >

                    {/* SECTION 1: CV UPLOAD */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-[var(--gold)] text-[var(--bg-root)] text-xs flex items-center justify-center font-bold">1</div>
                                Upload CV <span className="text-red-500">*</span>
                            </h2>
                            {cvFile && <Badge style="success">File Selected</Badge>}
                        </div>

                        <div
                            className={`
                relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ease-in-out cursor-pointer
                ${isDragging ? 'border-[var(--blue)] bg-[var(--bg-surface-2)]' : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-2)]'}
                ${cvFile ? 'bg-[var(--bg-surface-2)] border-[var(--border-strong)]' : ''}
                ${errors.cvFile ? 'border-red-500' : ''}
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

                            {cvFile ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-12 h-12 bg-[var(--bg-surface-1)] rounded-lg shadow-sm border border-[var(--border-subtle)] flex items-center justify-center mb-3">
                                        <FileText className="w-6 h-6 text-[var(--text-primary)]" />
                                    </div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">{cvFile.name}</p>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    {errors.cvFile && (
                                        <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span className="font-medium">{errors.cvFile.message}</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
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
                                    {errors.cvFile && (
                                        <div className="flex items-center justify-center gap-2 mt-3 text-red-600 text-xs animate-in slide-in-from-top-2">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span className="font-medium">{errors.cvFile.message}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="h-px bg-[var(--bg-surface-2)]"></div>

                    {/* SECTION 2: PERSONAL DETAILS */}
                    <section>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-[var(--gold)] text-[var(--bg-root)] text-xs flex items-center justify-center">2</div>
                            Personal Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    label="First Name" id="contact_first_name" required
                                    placeholder="Sarah"
                                    value={watch('contact_first_name')} onChange={e => setValue('contact_first_name', e.target.value)}
                                />
                                {errors.contact_first_name && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.contact_first_name.message}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Input
                                    label="Last Name" id="contact_last_name" required
                                    placeholder="Miller"
                                    value={watch('contact_last_name')} onChange={e => setValue('contact_last_name', e.target.value)}
                                />
                                {errors.contact_last_name && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.contact_last_name.message}</span>
                                    </div>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    label="Email Address" id="email" type="email" placeholder="you@company.com" required
                                    value={watch('email')} onChange={e => setValue('email', e.target.value)}
                                />
                                {errors.email && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.email.message}</span>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    LinkedIn URL <span className="text-[var(--text-tertiary)] text-xs font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        className={`block w-full rounded-lg border bg-[var(--bg-surface-2)] p-2.5 text-sm text-[var(--text-primary)] focus:ring-[var(--blue)] transition-colors ${errors.linkedinUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[var(--border-strong)] focus:border-[var(--blue)]'
                                            }`}
                                        placeholder="linkedin.com/in/..."
                                        value={linkedinUrl || ''}
                                        onChange={e => setValue('linkedinUrl', e.target.value)}
                                        onBlur={() => {
                                            if (linkedinUrl && !linkedinUrl.match(/^https?:\/\//)) {
                                                setValue('linkedinUrl', `https://${linkedinUrl}`);
                                            }
                                            trigger('linkedinUrl');
                                        }}
                                    />
                                </div>
                                {errors.linkedinUrl && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.linkedinUrl.message}</span>
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
                                            value={watch('country_code')}
                                            onChange={e => setValue('country_code', e.target.value)}
                                            className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)]"
                                        >
                                            <option value="">Code</option>
                                            {COUNTRY_CODES.map(country => (
                                                <option key={country.label} value={country.code}>
                                                    {country.flag} {country.label} ({country.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2 relative">
                                        <input
                                            type="tel"
                                            required
                                            className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)]"
                                            placeholder="790000000"
                                            value={watch('phoneNumber')} onChange={e => setValue('phoneNumber', e.target.value)}
                                        />
                                    </div>
                                </div>
                                {errors.country_code && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.country_code.message}</span>
                                    </div>
                                )}
                                {errors.phoneNumber && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.phoneNumber.message}</span>
                                    </div>
                                )}
                            </div>

                            {/* WORK ELIGIBILITY */}
                            <div className="md:col-span-2">
                                <label htmlFor="work_eligibility" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    Work Eligibility <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="work_eligibility"
                                    required
                                    value={watch('work_eligibility') ?? ''}
                                    onChange={e => setValue('work_eligibility', e.target.value as TalentPoolFormData['work_eligibility'])}
                                    className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)]"
                                >
                                    <option value="">Select your work eligibility...</option>
                                    {WORK_ELIGIBILITY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.work_eligibility && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.work_eligibility.message}</span>
                                    </div>
                                )}
                            </div>

                        </div>
                    </section>

                    <div className="h-px bg-[var(--bg-surface-2)]"></div>

                    {/* SECTION 3: EXPERIENCE */}
                    <section>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-[var(--gold)] text-[var(--bg-root)] text-xs flex items-center justify-center">3</div>
                            Experience
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <Input
                                    label="Years of Relevant Experience" id="years_of_experience" type="number" placeholder="e.g. 5" required min="0" max="50"
                                    value={watch('years_of_experience')?.toString() || ''} onChange={e => setValue('years_of_experience', parseInt(e.target.value) || 0)}
                                />
                                {errors.years_of_experience && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.years_of_experience.message}</span>
                                    </div>
                                )}
                            </div>

                            {/* Languages subsection - simplified checkboxes */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                                    Languages spoken with professional proficiency <span className="text-red-500">*</span>
                                </label>

                                <div className="space-y-3">
                                    {/* Base language checkboxes - inline with labels */}
                                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                                        {LANGUAGE_OPTIONS.map(lang => (
                                            <label key={lang} className="flex items-center gap-2 cursor-pointer select-none group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--gold)] focus:ring-[var(--gold)] focus:ring-offset-[var(--bg-root)] cursor-pointer accent-[var(--gold)]"
                                                    checked={(languages || []).includes(lang)}
                                                    onChange={() => {
                                                        const current = languages || [];
                                                        const updated = current.includes(lang)
                                                            ? current.filter(l => l !== lang)
                                                            : [...current, lang];
                                                        setValue('languages', updated);
                                                    }}
                                                />
                                                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                                    {lang}
                                                </span>
                                            </label>
                                        ))}

                                        {/* Other checkbox - inline with base languages */}
                                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--gold)] focus:ring-[var(--gold)] focus:ring-offset-[var(--bg-root)] cursor-pointer accent-[var(--gold)]"
                                                checked={showOtherLanguage}
                                                onChange={(e) => {
                                                    setShowOtherLanguage(e.target.checked);
                                                    if (!e.target.checked) setValue('other_language', '');
                                                }}
                                            />
                                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                                Other
                                            </span>
                                        </label>
                                    </div>

                                    {/* Conditional text input for Other language */}
                                    {showOtherLanguage && (
                                        <div className="animate-in fade-in slide-in-from-top-1 duration-200 pt-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. Spanish; Portuguese; Mandarin"
                                                className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)] placeholder-[var(--text-tertiary)]"
                                                maxLength={200}
                                                value={otherLanguage || ''}
                                                onChange={(e) => setValue('other_language', e.target.value)}
                                            />
                                            {errors.other_language && (
                                                <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span className="font-medium">{errors.other_language.message}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Validation Error for Languages */}
                                    {errors.languages && (
                                        <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span className="font-medium">{errors.languages.message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Key Achievement */}
                            <div>
                                <label htmlFor="highlight" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    Key Achievement
                                </label>
                                <textarea
                                    id="highlight"
                                    rows={3}
                                    maxLength={300}
                                    placeholder="Describe a significant accomplishment that showcases your expertise..."
                                    value={watch('highlight') || ''}
                                    onChange={e => setValue('highlight', e.target.value)}
                                    className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)] placeholder-[var(--text-tertiary)] resize-none"
                                />
                                {(watch('highlight')?.length || 0) > 300 && (
                                    <p className="text-xs text-red-500 mt-1.5">
                                        {watch('highlight')?.length || 0}/300 characters - exceeds limit
                                    </p>
                                )}
                            </div>

                            {/* Functional Expertise */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                                    Functional Expertise <span className="text-red-500">*</span>
                                    <span className="text-xs text-[var(--text-tertiary)] block mt-1 font-normal">
                                        Select 1-5 areas where you have professional experience
                                    </span>
                                </label>

                                <div className="flex flex-wrap gap-2">
                                    {FUNCTIONAL_EXPERTISE_OPTIONS.map((expertise: FunctionalExpertise) => (
                                        <label
                                            key={expertise}
                                            className={`
                                                cursor-pointer px-3 py-1.5 text-xs font-medium rounded border transition-all select-none
                                                has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[rgba(59,130,246,0.5)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--bg-root)]
                                                ${(functionalExpertise || []).includes(expertise)
                                                    ? 'bg-[var(--gold)] border-[var(--gold)] text-[var(--bg-root)] shadow-md'
                                                    : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'}
                                                ${!(functionalExpertise || []).includes(expertise) && (functionalExpertise || []).length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={(functionalExpertise || []).includes(expertise)}
                                                disabled={!(functionalExpertise || []).includes(expertise) && (functionalExpertise || []).length >= 5}
                                                onChange={() => {
                                                    const current = functionalExpertise || [];
                                                    const updated = current.includes(expertise)
                                                        ? current.filter(e => e !== expertise)
                                                        : current.length < 5 ? [...current, expertise as typeof current[number]] : current;
                                                    setValue('functional_expertise', updated, { shouldValidate: true });
                                                }}
                                            />
                                            {expertise}
                                        </label>
                                    ))}
                                </div>

                                {/* Selection counter */}
                                {(functionalExpertise || []).length > 0 && (
                                    <p className="text-xs text-[var(--text-tertiary)] mt-2">
                                        {(functionalExpertise || []).length}/5 selected
                                    </p>
                                )}

                                {/* Validation error */}
                                {errors.functional_expertise && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.functional_expertise.message}</span>
                                    </div>
                                )}

                                {/* Other expertise text input - conditional */}
                                {showOtherExpertise && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200 mt-3">
                                        <input
                                            type="text"
                                            placeholder="e.g., Structured Products; Derivatives; LNG Trading"
                                            className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)] placeholder-[var(--text-tertiary)]"
                                            maxLength={200}
                                            value={watch('other_expertise') || ''}
                                            onChange={(e) => setValue('other_expertise', e.target.value)}
                                        />
                                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                            Separate multiple areas with semicolons
                                        </p>
                                        {errors.other_expertise && (
                                            <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span className="font-medium">{errors.other_expertise.message}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-[var(--bg-surface-2)]"></div>

                    {/* SECTION 4: JOB PREFERENCES */}
                    <section>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-[var(--gold)] text-[var(--bg-root)] text-xs flex items-center justify-center">4</div>
                            Job Preferences
                        </h2>

                        <div className="space-y-6">

                            {/* Desired Roles */}
                            <div>
                                <label htmlFor="desired_roles" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    Desired Role(s) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="desired_roles"
                                    required
                                    placeholder="e.g., Senior Trader; Commodities Analyst; Risk Manager"
                                    value={watch('desired_roles')}
                                    onChange={e => setValue('desired_roles', e.target.value)}
                                    className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)] placeholder-[var(--text-tertiary)]"
                                />
                                <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
                                    Separate multiple roles with semicolons
                                </p>
                                {errors.desired_roles && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.desired_roles.message}</span>
                                    </div>
                                )}
                            </div>

                            {/* Notice Period */}
                            <div>
                                <label htmlFor="notice_period_months" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    Notice Period <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="notice_period_months"
                                    required
                                    value={watch('notice_period_months') ?? ''}
                                    onChange={e => setValue('notice_period_months', e.target.value as TalentPoolFormData['notice_period_months'])}
                                    className="block w-full rounded-lg border-[var(--border-strong)] bg-[var(--bg-surface-2)] border p-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--blue)] focus:ring-[var(--blue)]"
                                >
                                    <option value="">Select...</option>
                                    {NOTICE_PERIOD_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.notice_period_months && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.notice_period_months.message}</span>
                                    </div>
                                )}
                            </div>

                            {/* Salary Expectation */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                    Yearly Salary Expectation (CHF)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Min (e.g. 120000)"
                                            min="0" step="1000"
                                            className={`block w-full rounded-lg border bg-[var(--bg-surface-2)] p-2.5 text-sm text-[var(--text-primary)] focus:ring-[var(--blue)] transition-colors ${errors.salary_min ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[var(--border-strong)] focus:border-[var(--blue)]'
                                                }`}
                                            value={salaryMin ?? ''}
                                            onChange={(e) => setValue('salary_min', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Max (e.g. 150000)"
                                            min="0" step="1000"
                                            className={`block w-full rounded-lg border bg-[var(--bg-surface-2)] p-2.5 text-sm text-[var(--text-primary)] focus:ring-[var(--blue)] transition-colors ${errors.salary_max ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[var(--border-strong)] focus:border-[var(--blue)]'
                                                }`}
                                            value={salaryMax ?? ''}
                                            onChange={(e) => setValue('salary_max', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                </div>
                                {/* Validation Error */}
                                {errors.salary_min && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.salary_min.message}</span>
                                    </div>
                                )}
                                {/* Range Helper Text (Only show if no error) */}
                                {!errors.salary_min && salaryMin && salaryMax && (
                                    <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                                        Range: <span className="font-mono font-semibold text-[var(--text-primary)]">{formatCurrency(salaryMin)} – {formatCurrency(salaryMax)}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Preferred Locations (Max 5) <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-2">
                                    {WORK_LOCATIONS.map(location => (
                                        <label
                                            key={location.code}
                                            className={`
                        cursor-pointer px-3 py-1.5 text-xs font-medium rounded border transition-all select-none
                        has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[rgba(59,130,246,0.5)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--bg-root)]
                        ${(desiredLocations || []).some(loc => loc === location.code)
                                                    ? 'bg-[var(--gold)] border-[var(--gold)] text-[var(--bg-root)] shadow-md'
                                                    : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'}
                        ${!(desiredLocations || []).some(loc => loc === location.code) && (desiredLocations || []).length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                                        >
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={(desiredLocations || []).some(loc => loc === location.code)}
                                                disabled={!(desiredLocations || []).some(loc => loc === location.code) && (desiredLocations || []).length >= 5}
                                                onChange={() => {
                                                    const current = desiredLocations || [];
                                                    const updated = current.some(loc => loc === location.code)
                                                        ? current.filter(l => l !== location.code)
                                                        : current.length < 5 ? [...current, location.code as typeof current[number]] : current;
                                                    setValue('desired_locations', updated, { shouldValidate: true });
                                                }}
                                            />
                                            {location.name}
                                        </label>
                                    ))}
                                </div>
                                {(desiredLocations || []).length > 0 ? (
                                    <p className="text-xs text-[var(--text-tertiary)] mt-2">
                                        {(desiredLocations || []).length}/5 selected
                                    </p>
                                ) : errors.desired_locations ? (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">{errors.desired_locations.message}</span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Other Location - only show when "Others" is selected */}
                            {(desiredLocations || []).includes('Others') && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                    <Input
                                        label="Other Preferred Location"
                                        id="desired_other_location"
                                        placeholder="e.g., Remote, Berlin, Paris"
                                        required
                                        value={watch('desired_other_location') || ''}
                                        onChange={e => setValue('desired_other_location', e.target.value)}
                                    />
                                    {errors.desired_other_location && (
                                        <div className="flex items-center gap-2 mt-2 text-red-600 text-xs animate-in slide-in-from-top-2">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span className="font-medium">{errors.desired_other_location.message}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SUBMIT */}
                    <div className="pt-4">
                        <div className="flex items-start gap-3 mb-6 bg-[var(--bg-surface-2)] p-4 rounded-lg border border-[var(--border-subtle)]">
                            <input
                                type="checkbox"
                                id="accepted_terms"
                                required
                                checked={acceptedTerms === true}
                                onChange={(e) => setValue('accepted_terms', e.target.checked as unknown as true, { shouldValidate: true })}
                                className="checkbox-slate mt-1"
                            />
                            <label htmlFor="accepted_terms" className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                                I agree to the <button type="button" onClick={() => router.push('/terms')} className="underline text-[var(--text-primary)] hover:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.5)] focus:ring-offset-1 focus:ring-offset-[var(--bg-surface-2)] rounded">Terms of Service</button> and Privacy Policy. I understand that my profile will be anonymized and my contact details will only be shared with companies I explicitly approve.
                            </label>
                        </div>
                        {errors.accepted_terms && (
                            <div className="flex items-center gap-2 mb-4 text-red-600 text-xs animate-in slide-in-from-top-2">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="font-medium">{errors.accepted_terms.message}</span>
                            </div>
                        )}
                        <Button type="submit" className="w-full py-3 text-base" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default JoinForm;
