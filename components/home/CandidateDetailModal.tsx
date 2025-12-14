'use client';

import React from 'react';
import { Candidate } from '@/types/talentPool';
import { Badge, Button } from '@/components/ui';
import { WORK_ELIGIBILITY_OPTIONS, WORK_LOCATIONS } from '@/lib/constants';
import {
    X,
    MapPin,
    Clock,
    Briefcase,
    DollarSign,
    GraduationCap,
    Globe,
    FileCheck,
    Layers,
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1628]/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Modal */}
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-1)]">
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
                <div className="p-6 md:p-8 space-y-8">
                    {/* Main Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                            {candidate.role}
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)]">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-[var(--gold)]" />
                                {formatCantons(candidate.cantons)}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-[var(--gold)]" />
                                {candidate.experience}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-[var(--gold)]" />
                                {candidate.availability}
                            </div>
                        </div>
                    </div>

                    {/* Key Achievement / Highlight Box */}
                    {candidate.highlight && (
                        <div className="bg-[var(--gold-dim)] border border-[var(--gold-border)] rounded-xl p-5 relative overflow-hidden">
                            <h3 className="text-sm font-bold text-[var(--gold)] mb-2 uppercase tracking-wide flex items-center gap-2">
                                <User className="w-4 h-4" /> Key Achievement
                            </h3>
                            <p className="text-[var(--text-primary)] text-lg font-medium leading-relaxed">
                                &ldquo;{candidate.highlight}&rdquo;
                            </p>
                        </div>
                    )}

                    {/* Professional Profile */}
                    <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide mb-3">
                            Professional Profile
                        </h3>
                        {candidate.profileBio ? (
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                {candidate.profileBio}
                            </p>
                        ) : (
                            <p className="text-[var(--text-tertiary)] leading-relaxed text-sm italic">
                                Professional profile will be available once CV parsing is complete.
                            </p>
                        )}
                    </div>

                    {/* Two Column Layout: Skills + Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Core Competencies (Skills) */}
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide mb-3">
                                Core Competencies
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

                        {/* Details Column */}
                        <div className="space-y-4">
                            {/* Education */}
                            <div>
                                <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                                    Education
                                </h3>
                                <div className="flex items-center gap-2 text-[var(--text-primary)] text-sm font-medium">
                                    <GraduationCap className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                                    {candidate.education || 'Not specified'}
                                </div>
                            </div>

                            {/* Work Eligibility */}
                            <div>
                                <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                                    Work Eligibility
                                </h3>
                                <div className="flex items-center gap-2 text-[var(--text-primary)] text-sm font-medium">
                                    <FileCheck className="w-4 h-4 text-[var(--text-tertiary)]" />
                                    {getWorkPermitLabel(candidate.workPermit)}
                                </div>
                            </div>

                            {/* Salary Expectation */}
                            <div>
                                <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                                    Salary Expectation
                                </h3>
                                <div className="flex items-center gap-2 text-[var(--text-primary)] text-sm font-medium">
                                    <DollarSign className="w-4 h-4 text-[var(--text-tertiary)]" />
                                    {formatSalaryRange(candidate.salaryMin, candidate.salaryMax)}
                                </div>
                            </div>

                            {/* Languages */}
                            <div>
                                <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                                    Languages
                                </h3>
                                <div className="flex items-center gap-2 text-[var(--text-primary)] text-sm font-medium">
                                    <Globe className="w-4 h-4 text-[var(--text-tertiary)]" />
                                    {candidate.languages && candidate.languages.length > 0
                                        ? candidate.languages.join(', ')
                                        : 'Not specified'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Functional Expertise */}
                    {candidate.functionalExpertise && candidate.functionalExpertise.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4" /> Functional Expertise
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {candidate.functionalExpertise.map((exp, idx) => (
                                    <Badge key={idx} style="purple" icon={Layers}>
                                        {exp}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-1)]">
                    <p className="text-xs text-[var(--text-tertiary)] text-center sm:text-left">
                        Reference ID: {candidate.id} • Added {candidate.entryDate}
                    </p>
                    {onRequestIntroduction && (
                        <Button
                            variant="primary"
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
