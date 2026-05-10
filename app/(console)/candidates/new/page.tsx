'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileText, ChevronDown, ChevronUp, ArrowLeft, Loader2 } from 'lucide-react';
import { getMarketConfig, type Market } from '@/lib/markets';

export default function NewCandidatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [market, setMarket] = useState<Market>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('talentPoolMarket') as Market) || 'CH';
    }
    return 'CH';
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [workEligibility, setWorkEligibility] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [highlight, setHighlight] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const config = getMarketConfig(market);

  const handleMarketSwitch = (m: Market) => {
    setMarket(m);
    localStorage.setItem('talentPoolMarket', m);
    setWorkEligibility('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setCvFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCvFile(file);
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
      if (phone) formData.append('phone', phone);
      if (phone) formData.append('phoneCode', config.phoneCode);
      if (linkedin) formData.append('linkedin', linkedin);
      if (workEligibility) formData.append('workEligibility', workEligibility);
      if (yearsOfExperience) formData.append('yearsOfExperience', yearsOfExperience);
      if (highlight) formData.append('highlight', highlight);
      if (cvFile) formData.append('cv', cvFile);

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
      {/* Header */}
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
        {/* Market Toggle */}
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
                {mc.flag} {mc.name}
              </button>
            );
          })}
        </div>

        {/* Contact Details */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.8px] text-[var(--text-secondary)]">
            Contact Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                First Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                Last Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
              Email <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="candidate@email.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Phone</label>
              <div className="flex gap-1.5">
                <span className="flex items-center px-2.5 text-xs text-[var(--text-muted)] bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] rounded-md shrink-0">
                  {config.phoneCode}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">LinkedIn</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="linkedin.com/in/..."
              />
            </div>
          </div>
        </div>

        {/* CV Upload */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.8px] text-[var(--text-secondary)]">
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
                onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                dragOver
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)]'
                  : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-surface-2)]'
              }`}
            >
              <Upload size={24} className={dragOver ? 'text-[var(--primary-hover)]' : 'text-[var(--text-muted)]'} />
              <div className="text-sm text-[var(--text-secondary)]">
                Drop CV here or <span className="text-[var(--primary-hover)] font-medium">browse</span>
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

        {/* Additional Details (collapsible) */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.8px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
          >
            <span>Additional Details</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetails && (
            <div className="px-5 pb-5 space-y-4 border-t border-[var(--border-subtle)] pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Work Eligibility
                  </label>
                  <select
                    value={workEligibility}
                    onChange={(e) => setWorkEligibility(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="">Select...</option>
                    {config.workEligibility.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                  Key Highlight / Notes
                </label>
                <textarea
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] resize-none"
                  placeholder="Quick notes about this candidate..."
                />
              </div>
            </div>
          )}
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
              <>Add to {config.flag} {config.name} Pool</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
