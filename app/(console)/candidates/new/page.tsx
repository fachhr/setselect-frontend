'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileText, ArrowLeft, Loader2, Check } from 'lucide-react';
import { getMarketConfig, type Market } from '@/lib/markets';

const FUNCTIONAL_EXPERTISE_OPTIONS = [
  'Analytics',
  'Communication',
  'Compliance',
  'Engineering',
  'Finance',
  'HR',
  'Leadership',
  'Legal',
  'Operations',
  'Quantitative Analysis',
  'Research',
  'Risk Management',
  'Strategy',
  'Technology',
  'Trading',
  'Other',
];

const TRADING_SUB_OPTIONS = [
  'Energy Trading',
  'Gas Trading',
  'Power Trading',
  'LNG Trading',
  'Trading',
];

const NOTICE_PERIOD_OPTIONS = [
  { label: 'Immediate', value: '0' },
  { label: '1 Month', value: '1' },
  { label: '2 Months', value: '2' },
  { label: '3 Months', value: '3' },
  { label: '4 Months', value: '4' },
  { label: '5 Months', value: '5' },
  { label: '6 Months', value: '6' },
  { label: 'Negotiable', value: '-1' },
];

function MultiSelect({
  options,
  selected,
  onChange,
  max,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vals: string[]) => void;
  max?: number;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else if (!max || selected.length < max) {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border transition-all cursor-pointer ${
              active
                ? 'bg-[var(--primary-dim)] border-[var(--primary)] text-[var(--primary-hover)]'
                : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
            }`}
          >
            {active && <Check size={12} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]';

const labelClass = 'block text-[11px] font-medium text-[var(--text-muted)] mb-1';

export default function NewCandidatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [market, setMarket] = useState<Market>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('talentPoolMarket') as Market) || 'CH';
    }
    return 'CH';
  });

  // Contact
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // CV
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Professional
  const [workEligibility, setWorkEligibility] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [otherLanguage, setOtherLanguage] = useState('');
  const [functionalExpertise, setFunctionalExpertise] = useState<string[]>([]);
  const [otherExpertise, setOtherExpertise] = useState('');
  const [highlight, setHighlight] = useState('');

  // Assignment
  const [owner, setOwner] = useState('');

  // Preferences
  const [desiredRoles, setDesiredRoles] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [desiredLocations, setDesiredLocations] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const config = getMarketConfig(market);

  const handleMarketSwitch = (m: Market) => {
    setMarket(m);
    localStorage.setItem('talentPoolMarket', m);
    setWorkEligibility('');
    setLanguages([]);
    setDesiredLocations([]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === 'application/pdf' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      setCvFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCvFile(file);
  };

  const showTradingSubs =
    functionalExpertise.includes('Trading') ||
    functionalExpertise.some((e) => TRADING_SUB_OPTIONS.includes(e));

  const handleExpertiseToggle = (vals: string[]) => {
    if (!vals.includes('Trading')) {
      setFunctionalExpertise(vals.filter((v) => !TRADING_SUB_OPTIONS.includes(v)));
    } else {
      setFunctionalExpertise(vals);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('market', market);

      if (phone) {
        formData.append('phone', phone);
        formData.append('phoneCode', config.phoneCode);
      }
      if (linkedin) formData.append('linkedin', linkedin);
      if (workEligibility) formData.append('workEligibility', workEligibility);
      if (yearsOfExperience) formData.append('yearsOfExperience', yearsOfExperience);
      if (highlight) formData.append('highlight', highlight);
      if (cvFile) formData.append('cv', cvFile);

      if (languages.length > 0) formData.append('languages', JSON.stringify(languages));
      if (otherLanguage) formData.append('otherLanguage', otherLanguage);
      if (functionalExpertise.length > 0)
        formData.append('functionalExpertise', JSON.stringify(functionalExpertise));
      if (otherExpertise) formData.append('otherExpertise', otherExpertise);
      if (desiredRoles) formData.append('desiredRoles', desiredRoles);
      if (noticePeriod) formData.append('noticePeriod', noticePeriod);
      if (desiredLocations.length > 0)
        formData.append('desiredLocations', JSON.stringify(desiredLocations));
      if (salaryMin) formData.append('salaryMin', salaryMin);
      if (salaryMax) formData.append('salaryMax', salaryMax);
      if (owner) formData.append('owner', owner);

      const res = await fetch('/api/candidates/create', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Submission failed');
        setSubmitting(false);
        return;
      }

      router.push(`/candidates?highlight=${data.profileId}`);
    } catch {
      setError('Network error — please try again');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Add New Candidate</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Context: Market + Owner */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-1 p-1 bg-[var(--bg-surface-2)] rounded-lg w-fit">
            {(['CH', 'BG'] as const).map((m) => {
              const mc = getMarketConfig(m);
              const active = market === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMarketSwitch(m)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {mc.code} — {mc.name}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-medium text-[var(--text-muted)] whitespace-nowrap">Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] w-40"
              placeholder="e.g. Silvia"
            />
          </div>
        </div>

        {/* CV Upload */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-3">
          <h2 className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)]">
            CV / Resume
          </h2>
          {cvFile ? (
            <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface-2)] rounded-md">
              <FileText size={20} className="text-[var(--primary-hover)] shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-[var(--text-primary)] truncate">{cvFile.name}</div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {(cvFile.size / 1024).toFixed(0)} KB
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCvFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                dragOver
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)]'
                  : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-surface-2)]'
              }`}
            >
              <Upload
                size={24}
                className={dragOver ? 'text-[var(--primary-hover)]' : 'text-[var(--text-muted)]'}
              />
              <div className="text-sm text-[var(--text-secondary)]">
                Drop CV here or{' '}
                <span className="text-[var(--primary-hover)] font-medium">browse</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">PDF or DOCX, max 5MB</div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-[11px] text-[var(--text-muted)]">
            The CV parser will automatically extract education, experience, and skills.
          </p>
        </div>

        {/* Contact Details */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-4">
          <h2 className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)]">
            Contact Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                First Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="First name"
              />
            </div>
            <div>
              <label className={labelClass}>
                Last Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>
              Email <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="candidate@email.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Phone</label>
              <div className="flex gap-1.5">
                <span className="flex items-center px-2.5 text-xs text-[var(--text-muted)] bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] rounded-md shrink-0">
                  {config.phoneCode}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className={inputClass}
                placeholder="linkedin.com/in/..."
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-4">
          <h2 className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)]">
            Professional Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Work Eligibility</label>
              <select
                value={workEligibility}
                onChange={(e) => setWorkEligibility(e.target.value)}
                className={inputClass}
              >
                <option value="">Select...</option>
                {config.workEligibility.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className={inputClass}
                placeholder="e.g. 5"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Languages</label>
            <MultiSelect
              options={config.languages.map((l) => ({ value: l, label: l }))}
              selected={languages}
              onChange={setLanguages}
            />
            <input
              type="text"
              value={otherLanguage}
              onChange={(e) => setOtherLanguage(e.target.value)}
              className={`${inputClass} mt-2`}
              placeholder="Other languages (semicolon-separated)"
            />
          </div>

          <div>
            <label className={labelClass}>
              Functional Expertise{' '}
              <span className="text-[var(--text-muted)] font-normal">(max 5)</span>
            </label>
            <MultiSelect
              options={FUNCTIONAL_EXPERTISE_OPTIONS.map((e) => ({ value: e, label: e }))}
              selected={functionalExpertise.filter(
                (e) => FUNCTIONAL_EXPERTISE_OPTIONS.includes(e),
              )}
              onChange={handleExpertiseToggle}
              max={5}
            />
            {showTradingSubs && (
              <div className="mt-2 pl-3 border-l-2 border-[var(--primary-dim)]">
                <label className={labelClass}>Trading Specialisation</label>
                <MultiSelect
                  options={TRADING_SUB_OPTIONS.map((e) => ({ value: e, label: e }))}
                  selected={functionalExpertise.filter((e) => TRADING_SUB_OPTIONS.includes(e))}
                  onChange={(subs) => {
                    const nonTrading = functionalExpertise.filter(
                      (e) => !TRADING_SUB_OPTIONS.includes(e),
                    );
                    setFunctionalExpertise([...nonTrading, ...subs]);
                  }}
                />
              </div>
            )}
            {functionalExpertise.includes('Other') && (
              <input
                type="text"
                value={otherExpertise}
                onChange={(e) => setOtherExpertise(e.target.value)}
                className={`${inputClass} mt-2`}
                placeholder="Other expertise (semicolon-separated)"
              />
            )}
          </div>

          <div>
            <label className={labelClass}>Key Highlight / Notes</label>
            <textarea
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              maxLength={500}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Quick notes about this candidate..."
            />
          </div>
        </div>

        {/* Job Preferences */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-4">
          <h2 className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)]">
            Job Preferences
          </h2>

          <div>
            <label className={labelClass}>Desired Roles</label>
            <input
              type="text"
              value={desiredRoles}
              onChange={(e) => setDesiredRoles(e.target.value)}
              className={inputClass}
              placeholder="e.g. Senior Trader; Risk Manager"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Separate multiple roles with semicolons
            </p>
          </div>

          <div>
            <label className={labelClass}>Notice Period</label>
            <select
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value)}
              className={inputClass}
            >
              <option value="">Select...</option>
              {NOTICE_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Desired Locations{' '}
              <span className="text-[var(--text-muted)] font-normal">(max 5)</span>
            </label>
            <MultiSelect
              options={config.locations}
              selected={desiredLocations}
              onChange={setDesiredLocations}
              max={5}
            />
          </div>

          <div>
            <label className={labelClass}>
              Salary Expectation{' '}
              <span className="text-[var(--text-muted)] font-normal">
                ({config.currency.symbol} / year, optional)
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
                  {config.currency.symbol}
                </span>
                <input
                  type="number"
                  min={config.salaryRange.min}
                  max={config.salaryRange.max}
                  step={config.salaryRange.step}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="Min"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
                  {config.currency.symbol}
                </span>
                <input
                  type="number"
                  min={config.salaryRange.min}
                  max={config.salaryRange.max}
                  step={config.salaryRange.step}
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-md bg-[var(--error-dim)] border border-[var(--error)] text-sm text-[var(--error)]">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !firstName || !lastName || !email}
            className="btn-gold px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                Add to {config.name} Pool
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
