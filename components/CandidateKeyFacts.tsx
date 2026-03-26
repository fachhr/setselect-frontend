'use client';

import { Copy, Mail, Phone, MapPin, Briefcase, DollarSign, FileText, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { formatCantons, formatYearsExperience, formatSalary } from '@/lib/helpers';
import type { RecruiterCandidateView } from '@/types/recruiter';

interface CandidateKeyFactsProps {
  candidate: RecruiterCandidateView;
  onDownloadCv: (profileId: string) => void;
}

export function CandidateKeyFacts({ candidate, onDownloadCv }: CandidateKeyFactsProps) {
  const phone = candidate.phoneNumber
    ? `${candidate.country_code ? `+${candidate.country_code} ` : ''}${candidate.phoneNumber}`
    : null;

  return (
    <div className="bg-[var(--bg-surface-2)] rounded-lg p-3 border border-[var(--border-subtle)]">
      <div className="grid grid-cols-2 gap-2">
        {/* Email */}
        <button
          onClick={() => { navigator.clipboard.writeText(candidate.email); toast('success', 'Email copied'); }}
          className="flex items-center gap-2 text-sm cursor-pointer group w-full text-left"
        >
          <Mail size={13} className="text-[var(--text-muted)] shrink-0" />
          <span className="text-[var(--text-secondary)] truncate">{candidate.email}</span>
          <Copy size={10} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] shrink-0" />
        </button>

        {/* Phone */}
        {phone && (
          <button
            onClick={() => { navigator.clipboard.writeText(phone); toast('success', 'Phone copied'); }}
            className="flex items-center gap-2 text-sm cursor-pointer group w-full text-left"
          >
            <Phone size={13} className="text-[var(--text-muted)] shrink-0" />
            <span className="text-[var(--text-secondary)] truncate">{phone}</span>
            <Copy size={10} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] shrink-0" />
          </button>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={13} className="text-[var(--text-muted)] shrink-0" />
          <span className="text-[var(--text-secondary)] truncate">
            {formatCantons(candidate.desired_locations) || '—'}
          </span>
        </div>

        {/* Experience */}
        <div className="flex items-center gap-2 text-sm">
          <Briefcase size={13} className="text-[var(--text-muted)] shrink-0" />
          <span className="text-[var(--text-secondary)] truncate">
            {formatYearsExperience(candidate.years_of_experience)}
          </span>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign size={13} className="text-[var(--text-muted)] shrink-0" />
          <span className="text-[var(--text-secondary)] truncate">
            {formatSalary(candidate.salary_min, candidate.salary_max)}
          </span>
        </div>

        {/* CV Download */}
        {candidate.cv_storage_path && (
          <button
            onClick={() => onDownloadCv(candidate.profile_id)}
            className="flex items-center gap-2 text-sm cursor-pointer group w-full text-left"
          >
            <FileText size={13} className="text-[var(--text-muted)] shrink-0" />
            <span className="text-[var(--text-secondary)] truncate">
              {candidate.cv_original_filename || 'Download CV'}
            </span>
          </button>
        )}

        {/* LinkedIn */}
        {candidate.linkedinUrl && (
          <a
            href={candidate.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm group w-full"
          >
            <ExternalLink size={13} className="text-[var(--text-muted)] shrink-0" />
            <span className="text-[var(--text-secondary)] truncate">LinkedIn</span>
          </a>
        )}
      </div>
    </div>
  );
}
