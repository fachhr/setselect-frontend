'use client';

import React, { useEffect } from 'react';
import { Candidate } from '@/types/talentPool';
import { Badge, Button } from '@/components/ui';
import { WORK_ELIGIBILITY_OPTIONS, WORK_LOCATIONS } from '@/lib/formOptions';
import {
    X,
    MapPin,
    Clock,
    Briefcase,
    DollarSign,
    GraduationCap,
    Globe,
    FileCheck,
    User
} from 'lucide-react';

interface CandidateDetailModalProps {
    candidate: Candidate | null;
    isOpen: boolean;
    onClose: () => void;
    onRequestIntroduction?: (candidateId: string) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
    candidate,
    isOpen,
    onClose,
    onRequestIntroduction
}) => {
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    if (!isOpen || !candidate) return null;

    // Map work eligibility value to display label
    const getWorkPermitLabel = (value: string | undefined): string => {
        if (!value) return 'Not specified';
        const option = WORK_ELIGIBILITY_OPTIONS.find(opt => opt.value === value);
        return option?.label || value;
    };

    // Format salary range
    const formatSalaryRange = (min: number, max: number): string => {
        const formatNum = (n: number) => {
            if (!n) return '';
            return new Intl.NumberFormat('de-CH', {
                style: 'currency',
                currency: 'CHF',
                maximumSignificantDigits: 3,
            }).format(n);
        };

        if (!min && !max) return '-';
        if (min && max) return `${formatNum(min)} – ${formatNum(max)}`;
        if (min) return `From ${formatNum(min)}`;
        if (max) return `Up to ${formatNum(max)}`;
        return '-';
    };

    // Format canton codes to names
    const formatCantons = (cantons: string[]): string => {
        if (!cantons || cantons.length === 0) return 'Flexible';
        return cantons.map(code => WORK_LOCATIONS.find(c => c.code === code)?.name ?? code).join(', ');
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-root)]/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Modal */}
            <div
                className="relative w-full max-w-2xl max-h-[90vh] glass-panel rounded-2xl flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-1)] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-tertiary)] bg-[var(--bg-surface-2)] px-2 py-1 rounded border border-[var(--border-subtle)]">
                            {candidate.id}
                        </span>
                        <Badge style={candidate.seniority === 'Executive' ? 'gold' : 'default'}>
                            {candidate.seniority}
                        </Badge>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[var(--bg-surface-2)] transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto modal-scroll p-6 md:p-8 space-y-8">
                    {/* Main Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                            {candidate.role}
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)]">
                            <div className="flex items-start gap-1.5">
                                <MapPin className="w-4 h-4 text-[var(--secondary)] mt-0.5" />
                                {formatCantons(candidate.cantons)}
                            </div>
                            <div className="flex items-start gap-1.5">
                                <Briefcase className="w-4 h-4 text-[var(--secondary)] mt-0.5" />
                                {candidate.experience}
                            </div>
                            <div className="flex items-start gap-1.5">
                                <Clock className="w-4 h-4 text-[var(--secondary)] mt-0.5" />
                                {candidate.availability}
                            </div>
                        </div>
                    </div>

                    {/* Key Achievement / Highlight Box */}
                    {candidate.highlight && (
                        <div className="bg-[var(--highlight-dim)] border border-[rgba(144,224,239,0.30)] rounded-xl p-5 relative overflow-hidden">
                            <h3 className="text-sm font-bold text-[var(--highlight)] mb-2 uppercase tracking-wide flex items-center gap-2">
                                <User className="w-4 h-4" /> Key Achievement
                            </h3>
                            <p className="text-[var(--text-primary)] text-lg font-medium leading-relaxed">
                                &ldquo;{candidate.highlight}&rdquo;
                            </p>
                        </div>
                    )}

                    {/* Previous Roles Section */}
                    {candidate.previousRoles && candidate.previousRoles.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide mb-3">
                                Previous Roles
                            </h3>
                            <div className="flex flex-col gap-2">
                                {candidate.previousRoles.map((roleObj, idx) => (
                                    <div key={idx} className="flex items-start justify-between gap-3 text-sm text-[var(--text-secondary)]">
                                        <div className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] mt-[7px]"></div>
                                            <span>{roleObj.role}</span>
                                        </div>
                                        {(roleObj.location || roleObj.duration) && (
                                            <span className="text-[var(--text-tertiary)] text-xs whitespace-nowrap flex-shrink-0">
                                                {roleObj.location}{roleObj.location && roleObj.duration && ' · '}{roleObj.duration}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Professional Profile */}
                    <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide mb-3">
                            Professional Profile
                        </h3>
                        {candidate.profileBio ? (
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {candidate.profileBio}
                            </p>
                        ) : (
                            <p className="text-[var(--text-tertiary)] leading-relaxed text-sm italic">
                                Professional profile will be available soon.
                            </p>
                        )}
                    </div>

                    {/* Two Column Layout: Expertise & Skills + Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Expertise & Skills */}
                        <div className="space-y-6">
                            {/* Functional Expertise */}
                            {candidate.functionalExpertise && candidate.functionalExpertise.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide mb-3">
                                        Functional Expertise
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.functionalExpertise.map((exp, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-3 py-1.5 bg-[var(--expertise-dim)] border border-[var(--expertise-border)] text-[var(--expertise)] text-sm font-medium rounded-md"
                                            >
                                                {exp}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tech Skills */}
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide mb-3">
                                    Tech Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills && candidate.skills.length > 0 ? (
                                        candidate.skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-[var(--text-secondary)] text-sm font-medium rounded-md"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[var(--text-tertiary)] text-sm">Not specified</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details Column */}
                        <div className="space-y-4">
                            {/* Education */}
                            <div>
                                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                                    <GraduationCap className="w-4 h-4" />
                                    Education
                                </h3>
                                <div className="text-sm text-[var(--text-secondary)]">
                                    {candidate.education || 'Not specified'}
                                </div>
                            </div>

                            {/* Work Eligibility */}
                            <div>
                                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                                    <FileCheck className="w-4 h-4" />
                                    Work Eligibility
                                </h3>
                                <div className="text-sm text-[var(--text-secondary)]">
                                    {getWorkPermitLabel(candidate.workPermit)}
                                </div>
                            </div>

                            {/* Salary Expectation */}
                            <div>
                                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                                    <DollarSign className="w-4 h-4" />
                                    Salary Expectation
                                </h3>
                                <div className="text-sm text-[var(--text-secondary)]">
                                    {formatSalaryRange(candidate.salaryMin, candidate.salaryMax)}
                                </div>
                            </div>

                            {/* Languages */}
                            <div>
                                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                                    <Globe className="w-4 h-4" />
                                    Languages
                                </h3>
                                <div className="text-sm text-[var(--text-secondary)]">
                                    {candidate.languages && candidate.languages.length > 0
                                        ? candidate.languages.join(', ')
                                        : 'Not specified'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-1)] rounded-b-2xl">
                    <p className="text-xs text-[var(--text-tertiary)] text-center sm:text-left">
                        Reference ID: {candidate.id} • Added {candidate.entryDate}
                    </p>
                    {onRequestIntroduction && (
                        <Button
                            variant="primary"
                            className="w-full sm:w-auto"
                            onClick={() => onRequestIntroduction(candidate.id)}
                        >
                            Request Introduction
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateDetailModal;
