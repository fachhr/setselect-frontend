import React, { useState, useRef } from 'react';
import {
    Upload,
    FileText,
    CheckCircle,
    ArrowLeft,
    Linkedin,
    Smartphone,
    AlertCircle
} from 'lucide-react';
import { Button, Input, Badge } from './UI.tsx';
import { CANTONS, NOTICE_PERIOD_OPTIONS } from '../constants.ts';

interface JoinFormProps {
    onBack: () => void;
    onTermsClick: () => void;
}

const JoinForm: React.FC<JoinFormProps> = ({ onBack, onTermsClick }) => {
    const [step, setStep] = useState(1); // 1: CV, 2: Details, 3: Success
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        linkedin: '',
        countryCode: '',
        phone: '',
        role: '',
        experienceYears: '',
        noticePeriod: '',
        salaryMin: '',
        salaryMax: '',
        location: [] as string[]
    });

    // Validation Logic
    const salaryMinNum = Number(formData.salaryMin);
    const salaryMaxNum = Number(formData.salaryMax);
    const hasSalaryError = formData.salaryMin !== '' && formData.salaryMax !== '' && salaryMaxNum < salaryMinNum;

    // LinkedIn Validation: Must contain 'linkedin.com' if not empty
    const hasLinkedinError = formData.linkedin.length > 0 && !formData.linkedin.includes('linkedin.com');

    // Location Validation: Must have at least 1 selected
    const hasLocationError = formData.location.length === 0;

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hasSalaryError || hasLinkedinError || hasLocationError) return;
        // Mock API call
        setTimeout(() => setStep(3), 1000);
    };

    // Helper to format currency for display
    const formatCurrency = (val: string | number) => {
        if (!val) return '';
        return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumSignificantDigits: 3 }).format(Number(val));
    };

    if (step === 3) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
                <div className="max-w-2xl mx-auto pt-12 pb-24 px-4 text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Received</h2>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
                        We've received your profile. Our team will review your anonymized data and match you with top Swiss companies within 48 hours.
                    </p>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 max-w-md mx-auto mb-8">
                        <h3 className="font-medium text-slate-900 mb-2">What happens next?</h3>
                        <ul className="text-sm text-slate-600 space-y-2 text-left">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>We verify your skills and experience</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>Your anonymized profile goes live</li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>Companies request to meet you</li>
                        </ul>
                    </div>
                    <Button onClick={onBack} icon={ArrowLeft}>Back to Candidates</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={onBack}
                            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">Join Silvia's List</h1>
                        <p className="mt-4 text-lg text-slate-500">Create your profile and connect with top opportunities in Switzerland.</p>
                    </div>
                </div>
            </div>

            {/* Main Form Content - No Shadow Card */}
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-8 space-y-10 md:p-12">

                    {/* SECTION 1: CV UPLOAD */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-slate-900 text-white text-xs flex items-center justify-center">1</div>
                                Upload CV
                            </h2>
                            {file && <Badge style="success">File Selected</Badge>}
                        </div>

                        <div
                            className={`
                relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ease-in-out
                ${isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'}
                ${file ? 'bg-slate-50 border-slate-300' : ''}
              `}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
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
                                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center mb-3">
                                        <FileText className="w-6 h-6 text-slate-900" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {isDragging ? 'Drop your CV here' : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2">PDF or DOCX (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="h-px bg-slate-100"></div>

                    {/* SECTION 2: PERSONAL DETAILS */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-slate-900 text-white text-xs flex items-center justify-center">2</div>
                            Personal Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="First Name" id="firstName" required
                                value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <Input
                                label="Last Name" id="lastName" required
                                value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                            <div className="md:col-span-2">
                                <Input
                                    label="Email Address" id="email" type="email" placeholder="you@company.com" required
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    LinkedIn URL <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="url"
                                        required
                                        className={`block w-full rounded-lg border bg-slate-50 p-2.5 pl-10 text-sm text-slate-900 shadow-sm focus:ring-slate-900 transition-colors ${hasLinkedinError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-slate-900'
                                            }`}
                                        placeholder="linkedin.com/in/..."
                                        value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
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
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <select
                                            id="country_code"
                                            required
                                            value={formData.countryCode}
                                            onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                                            className="block w-full rounded-lg border-slate-300 bg-slate-50 border p-2.5 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:ring-slate-900"
                                        >
                                            <option value="">Code</option>
                                            <option value="+41">🇨🇭 +41</option>
                                            <option value="+49">🇩🇪 +49</option>
                                            <option value="+33">🇫🇷 +33</option>
                                            <option value="+39">🇮🇹 +39</option>
                                            <option value="+43">🇦🇹 +43</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+1">🇺🇸 +1</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 relative">
                                        <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            required
                                            className="block w-full rounded-lg border-slate-300 bg-slate-50 border p-2.5 pl-10 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:ring-slate-900"
                                            placeholder="79 000 00 00"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>

                    <div className="h-px bg-slate-100"></div>

                    {/* SECTION 3: JOB PROFILE */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-slate-900 text-white text-xs flex items-center justify-center">3</div>
                            Job Profile
                        </h2>

                        <div className="space-y-6">
                            <Input
                                label="Current Role / Title" id="role" placeholder="e.g. Senior Frontend Engineer" required
                                value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                            />

                            <Input
                                label="Years of Relevant Experience" id="experience" type="number" placeholder="e.g. 5" required min="0"
                                value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                            />
                        </div>
                    </section>

                    <div className="h-px bg-slate-100"></div>

                    {/* SECTION 4: JOB PREFERENCES */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-slate-900 text-white text-xs flex items-center justify-center">4</div>
                            Job Preferences
                        </h2>

                        <div className="space-y-6">

                            {/* Notice Period */}
                            <div>
                                <label htmlFor="noticePeriod" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Notice Period <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="noticePeriod"
                                    required
                                    value={formData.noticePeriod}
                                    onChange={e => setFormData({ ...formData, noticePeriod: e.target.value })}
                                    className="block w-full rounded-lg border-slate-300 bg-slate-50 border p-2.5 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:ring-slate-900"
                                >
                                    <option value="">Select...</option>
                                    {NOTICE_PERIOD_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Salary Expectation */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Yearly Salary Expectation (CHF) <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Min (e.g. 120000)"
                                            min="0" step="1000"
                                            required
                                            className={`block w-full rounded-lg border bg-slate-50 p-2.5 text-sm text-slate-900 shadow-sm focus:ring-slate-900 transition-colors ${hasSalaryError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-slate-900'
                                                }`}
                                            value={formData.salaryMin}
                                            onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Max (e.g. 150000)"
                                            min="0" step="1000"
                                            required
                                            className={`block w-full rounded-lg border bg-slate-50 p-2.5 text-sm text-slate-900 shadow-sm focus:ring-slate-900 transition-colors ${hasSalaryError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-slate-900'
                                                }`}
                                            value={formData.salaryMax}
                                            onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
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
                                {!hasSalaryError && formData.salaryMin && formData.salaryMax && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Range: <span className="font-mono font-semibold text-slate-900">{formatCurrency(formData.salaryMin)} – {formatCurrency(formData.salaryMax)}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Preferred Locations (Max 5)</label>
                                <div className="flex flex-wrap gap-2">
                                    {CANTONS.map(canton => (
                                        <label
                                            key={canton.code}
                                            className={`
                        cursor-pointer px-3 py-1.5 text-xs font-medium rounded border transition-all select-none
                        ${formData.location.includes(canton.code)
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}
                        ${!formData.location.includes(canton.code) && formData.location.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.location.includes(canton.code)}
                                                disabled={!formData.location.includes(canton.code) && formData.location.length >= 5}
                                                onChange={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        location: prev.location.includes(canton.code)
                                                            ? prev.location.filter(l => l !== canton.code)
                                                            : prev.location.length < 5 ? [...prev.location, canton.code] : prev.location
                                                    }))
                                                }}
                                            />
                                            {canton.name}
                                        </label>
                                    ))}
                                </div>
                                {formData.location.length > 0 ? (
                                    <p className="text-xs text-slate-400 mt-2">
                                        {formData.location.length}/5 selected
                                    </p>
                                ) : (
                                    <div className="flex items-center gap-2 mt-2 text-amber-600 text-xs animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="font-medium">At least one location must be selected.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* SUBMIT */}
                    <div className="pt-4">
                        <div className="flex items-start gap-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <input type="checkbox" id="terms" required className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 bg-white focus:ring-slate-900" />
                            <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                                I agree to the <button type="button" onClick={onTermsClick} className="underline text-slate-900 hover:text-slate-700">Terms of Service</button> and Privacy Policy. I understand that my profile will be anonymized and my contact details will only be shared with companies I explicitly approve.
                            </label>
                        </div>
                        <Button type="submit" className="w-full py-3 text-base" disabled={!file || hasSalaryError || hasLinkedinError || hasLocationError}>
                            Submit Application
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default JoinForm;