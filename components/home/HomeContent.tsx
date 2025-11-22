'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Search,
    MapPin,
    Briefcase,
    ChevronDown,
    DollarSign,
    Clock,
    Filter,
    Mail,
    X
} from 'lucide-react';
import { CANTONS, MAIN_CANTON_CODES, SENIORITY_LEVELS } from '@/lib/constants';
import { Badge, Button } from '@/components/ui';
import { Candidate } from '@/types/talentPool';

interface ApiCandidate {
    talent_id: string;
    role: string;
    skills: string[];
    years_of_experience: number;
    seniority_level: string;
    preferred_cantons: string[];
    salary_range: { min: number | null; max: number | null };
    availability: string;
    entry_date: string;
}

export default function HomeContent() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCantons, setSelectedCantons] = useState<string[]>([]);
    const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
    const [salaryRange, setSalaryRange] = useState([0, 300000]);
    const [showContactModal, setShowContactModal] = useState<string | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [showAllCantons, setShowAllCantons] = useState(false);

    // Fetch candidates from API on mount
    useEffect(() => {
        async function fetchCandidates() {
            try {
                setIsLoading(true);
                const response = await fetch('/api/talent-pool/list');
                const result = await response.json();

                if (result.success && result.data.candidates) {
                    // Transform API response to match Candidate interface
                    const transformedCandidates: Candidate[] = result.data.candidates.map((c: ApiCandidate) => ({
                        id: c.talent_id,
                        role: c.role,
                        skills: c.skills || [],
                        experience: c.years_of_experience ? `${c.years_of_experience} years` : 'Not specified',
                        seniority: c.seniority_level === 'junior' ? 'Junior' :
                            c.seniority_level === 'mid' ? 'Mid-level' :
                                c.seniority_level === 'senior' ? 'Senior' : 'Executive',
                        cantons: c.preferred_cantons || [],
                        salaryMin: c.salary_range?.min || 0,
                        salaryMax: c.salary_range?.max || 0,
                        availability: c.availability || 'Negotiable',
                        entryDate: new Date(c.entry_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })
                    }));
                    setCandidates(transformedCandidates);
                }
            } catch (error) {
                console.error('Failed to fetch candidates:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCandidates();
    }, []);

    // Filter Logic
    const filteredCandidates = useMemo(() => {
        return candidates.filter((candidate) => {
            const matchesSearch =
                candidate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                candidate.id.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCanton =
                selectedCantons.length === 0 ||
                candidate.cantons.some((c) => selectedCantons.includes(c));

            const matchesSeniority =
                selectedSeniority.length === 0 || selectedSeniority.includes(candidate.seniority);

            const matchesSalary =
                candidate.salaryMin >= salaryRange[0] && candidate.salaryMax <= salaryRange[1];

            return matchesSearch && matchesCanton && matchesSeniority && matchesSalary;
        });
    }, [candidates, searchTerm, selectedCantons, selectedSeniority, salaryRange]);

    const toggleCanton = (code: string) => {
        setSelectedCantons((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
        );
    };

    const toggleSeniority = (value: string) => {
        setSelectedSeniority((prev) =>
            prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
        );
    };

    // Logic to determine which cantons to display in the filter sidebar
    const displayedCantons = useMemo(() => {
        if (showAllCantons) {
            return CANTONS;
        }

        // 1. Show the main, high-priority cantons
        const mainCantons = CANTONS.filter((c) => MAIN_CANTON_CODES.includes(c.code));

        // 2. Also ensure any currently selected cantons that are *not* main are still visible
        const selectedButNotMain = CANTONS.filter(
            (c) => selectedCantons.includes(c.code) && !MAIN_CANTON_CODES.includes(c.code)
        );

        // Combine them
        const combinedCantons = [...mainCantons, ...selectedButNotMain];

        // Get unique canton codes
        const uniqueCantonCodes = Array.from(new Set(combinedCantons.map((c) => c.code)));

        // Maintain the alphabetical order of the original list for display consistency
        return CANTONS.filter((c) => uniqueCantonCodes.includes(c.code));
    }, [showAllCantons, selectedCantons]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('de-CH', {
            style: 'currency',
            currency: 'CHF',
            maximumSignificantDigits: 3,
        }).format(val);
    };

    return (
        <div
            className="min-h-screen font-sans"
            style={{ scrollbarGutter: 'stable' }}
        >
            {/* HERO SECTION */}
            <div className="bg-[var(--bg-root)] border-b border-[var(--border-subtle)] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--gold)] opacity-5 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--blue)] opacity-5 blur-[120px] rounded-full"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center relative z-10">
                    <div className="inline-block mb-6">
                        <Badge style="gold">Switzerland&apos;s #1 Tech Talent Pool</Badge>
                    </div>
                    <h1 className="mt-6 text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                        Discover exceptional <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
                            tech talent
                        </span>
                        .
                    </h1>
                    <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-light leading-relaxed">
                        Browse pre-screened professionals in Zurich, Geneva, and beyond. <br className="hidden sm:block" />
                        Skip the recruiters and connect directly with candidates ready for their next opportunity.
                    </p>
                </div>
            </div>

            {/* DASHBOARD CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* SIDEBAR FILTERS */}
                    <aside className="w-full lg:w-72 flex-shrink-0 space-y-4 lg:space-y-0">
                        {/* Mobile Filter Toggle */}
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-surface-2)] border border-[var(--border-strong)] rounded-lg text-sm font-medium text-[var(--text-primary)]"
                            >
                                <span className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" /> Filters
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </div>

                        {/* Filter Content Container */}
                        <div
                            className={`space-y-8 ${isFiltersOpen ? 'block' : 'hidden'} lg:block animate-in slide-in-from-top-2 duration-200`}
                        >
                            {/* Search */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search skills, roles..."
                                    className="input-base w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-3" />
                            </div>

                            {/* Seniority Filter */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Briefcase className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Seniority
                                </h3>
                                <div className="space-y-2.5">
                                    {SENIORITY_LEVELS.map((level) => (
                                        <label
                                            key={level.value}
                                            className="flex items-center gap-3 group cursor-pointer select-none"
                                        >
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-slate"
                                                    checked={selectedSeniority.includes(level.value)}
                                                    onChange={() => toggleSeniority(level.value)}
                                                />
                                            </div>
                                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                                {level.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Canton Filter */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Preferred Location
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayedCantons.map((canton) => (
                                        <button
                                            key={canton.code}
                                            onClick={() => toggleCanton(canton.code)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded border transition-all duration-200 ${selectedCantons.includes(canton.code)
                                                ? 'bg-[var(--blue)] border-[var(--blue)] text-white shadow-md'
                                                : 'bg-[var(--bg-surface-2)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--blue)]'
                                                }`}
                                        >
                                            {canton.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Toggle Button */}
                                {CANTONS.length > MAIN_CANTON_CODES.length && (
                                    <button
                                        onClick={() => setShowAllCantons(!showAllCantons)}
                                        className="mt-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-colors"
                                    >
                                        {showAllCantons ? (
                                            <>
                                                Show fewer Cantons{' '}
                                                <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform" />
                                            </>
                                        ) : (
                                            <>
                                                Show all {CANTONS.length} Cantons{' '}
                                                <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Salary Filter */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Salary (CHF)
                                </h3>
                                <div className="px-1">
                                    <input
                                        type="range"
                                        min="50000"
                                        max="300000"
                                        step="10000"
                                        className="w-full h-1 bg-[var(--bg-surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--blue)]"
                                        onChange={(e) => setSalaryRange([50000, parseInt(e.target.value)])}
                                    />
                                    <div className="flex justify-between mt-3 text-xs text-[var(--text-tertiary)] font-medium font-mono">
                                        <span>50K</span>
                                        <span>{salaryRange[1] / 1000}K+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(selectedCantons.length > 0 || selectedSeniority.length > 0 || searchTerm) && (
                                <button
                                    onClick={() => {
                                        setSelectedCantons([]);
                                        setSelectedSeniority([]);
                                        setSearchTerm('');
                                        setSalaryRange([0, 300000]);
                                    }}
                                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-colors border-b border-transparent hover:border-[var(--text-primary)] pb-0.5 w-max"
                                >
                                    <X className="w-3 h-3" /> Clear all filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* RESULTS GRID */}
                    <main className="flex-1">
                        <div className="flex justify-between items-end mb-6 pb-4 border-b border-[var(--border-subtle)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Candidates{' '}
                                <span className="text-[var(--text-tertiary)] font-light ml-2 text-lg">
                                    {filteredCandidates.length} results
                                </span>
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] group cursor-pointer hover:text-[var(--text-primary)] transition-colors">
                                Sort by: <span className="font-medium text-[var(--text-primary)]">Newest</span>
                                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="glass-panel rounded-xl p-16 text-center">
                                <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border-subtle)] animate-pulse">
                                    <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
                                </div>
                                <h3 className="text-lg font-medium text-[var(--text-primary)]">Loading candidates...</h3>
                                <p className="text-[var(--text-secondary)] mt-1 text-sm">
                                    Fetching latest talent pool data.
                                </p>
                            </div>
                        ) : filteredCandidates.length === 0 ? (
                            <div className="glass-panel rounded-xl border-dashed p-16 text-center">
                                <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border-subtle)]">
                                    <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
                                </div>
                                <h3 className="text-lg font-medium text-[var(--text-primary)]">No candidates found</h3>
                                <p className="text-[var(--text-secondary)] mt-1 text-sm">
                                    Adjust your filters to broaden your search.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredCandidates.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        className="group glass-panel rounded-xl p-6 hover:border-[var(--gold)] hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-300 relative"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] border border-[var(--border-strong)] px-1.5 py-0.5 rounded">
                                                        {candidate.id}
                                                    </span>
                                                    <Badge style={candidate.seniority === 'Executive' ? 'gold' : 'default'}>
                                                        {candidate.seniority}
                                                    </Badge>
                                                    <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 ml-auto sm:ml-0">
                                                        <Clock className="w-3 h-3" /> Added {candidate.entryDate}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--gold)] transition-colors">
                                                    {candidate.role}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)] mt-4 mb-5">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                        {candidate.experience}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                        {candidate.cantons.join(', ')}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                        <span className="font-mono">
                                                            {formatCurrency(candidate.salaryMin)} – {formatCurrency(candidate.salaryMax)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {candidate.skills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="px-2.5 py-1 bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-[var(--text-secondary)] text-xs font-medium rounded transition-colors cursor-default"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:items-end gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)] min-w-[140px]">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1 font-semibold">
                                                        Availability
                                                    </p>
                                                    <p className="text-sm font-medium text-[var(--text-primary)]">{candidate.availability}</p>
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    className="w-full sm:w-auto text-xs sm:text-sm"
                                                    onClick={() => setShowContactModal(candidate.id)}
                                                >
                                                    Request Intro
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* CONTACT MODAL (For Specific Candidate Intro) */}
            {showContactModal && (
                <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-surface-1)] rounded-2xl shadow-2xl border border-[var(--border-strong)] max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setShowContactModal(null)}
                            className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-strong)] text-[var(--gold)]">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">Request Introduction</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">
                                Interested in candidate{' '}
                                <span className="font-mono text-[var(--gold)]">
                                    {showContactModal}
                                </span>
                                ?
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-[var(--bg-surface-2)] p-4 rounded-lg border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] text-center leading-relaxed">
                                Please email us at{' '}
                                <strong className="text-[var(--text-primary)] border-b border-[var(--gold)]">
                                    silvia@silviaslist.com
                                </strong>
                                <br /> quoting the Talent ID above.
                            </div>

                            <Button
                                className="w-full"
                                variant="primary"
                                onClick={() => {
                                    console.log(`Email copied! Reference ID: ${showContactModal}`);
                                    setShowContactModal(null);
                                }}
                            >
                                Copy Email Address
                            </Button>

                            <Button
                                onClick={() => setShowContactModal(null)}
                                className="w-full"
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
