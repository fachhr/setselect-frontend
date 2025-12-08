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
    X,
    LayoutGrid,
    Table as TableIcon,
    ArrowUp,
    ArrowDown,
    Heart,
    Globe,
    FileCheck,
    GraduationCap,
    Layers
} from 'lucide-react';
import { WORK_LOCATIONS, SENIORITY_LEVELS, WORK_ELIGIBILITY_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants';
import { Badge, Button, Toast } from '@/components/ui';
import { Candidate } from '@/types/talentPool';
import { CandidateDetailModal } from './CandidateDetailModal';

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
    // New fields
    highlight?: string | null;
    education?: string | null;
    work_eligibility?: string | null;
    languages?: string[];
    functional_expertise?: string[];
    desired_roles?: string | null;
}

export default function HomeContent() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedWorkEligibility, setSelectedWorkEligibility] = useState<string[]>([]);
    const [salaryRange, setSalaryRange] = useState([0, 300000]);
    const [showContactModal, setShowContactModal] = useState<string | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'availability'>('newest');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
        key: null,
        direction: 'asc'
    });
    // New state for favorites, detail modal, toast
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; isVisible: boolean; type: 'success' | 'error' | 'info' }>({
        message: '',
        isVisible: false,
        type: 'success'
    });

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
                        }),
                        // New fields
                        highlight: c.highlight || undefined,
                        education: c.education || undefined,
                        workPermit: c.work_eligibility || undefined,
                        languages: c.languages || [],
                        functionalExpertise: c.functional_expertise || []
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
            // Favorites filter
            const matchesFavorites = !showFavoritesOnly || favorites.includes(candidate.id);

            const matchesSearch =
                candidate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                candidate.id.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesLocation =
                selectedLocations.length === 0 ||
                candidate.cantons.some((c) => selectedLocations.includes(c));

            const matchesSeniority =
                selectedSeniority.length === 0 || selectedSeniority.includes(candidate.seniority);

            // Language filter (candidate must have ALL selected languages)
            const matchesLanguage =
                selectedLanguages.length === 0 ||
                selectedLanguages.every((lang) => candidate.languages?.includes(lang));

            // Work eligibility filter (candidate matches ANY selected eligibility)
            const matchesWorkEligibility =
                selectedWorkEligibility.length === 0 ||
                selectedWorkEligibility.includes(candidate.workPermit || '');

            const matchesSalary =
                salaryRange[1] === 300000
                    ? candidate.salaryMin >= salaryRange[0]
                    : candidate.salaryMin >= salaryRange[0] && candidate.salaryMax <= salaryRange[1];

            return matchesFavorites && matchesSearch && matchesLocation && matchesSeniority && matchesLanguage && matchesWorkEligibility && matchesSalary;
        }).sort((a, b) => {
            if (sortBy === 'newest') {
                // Sort by entry date (newest first)
                return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
            } else {
                // Sort by availability
                const getAvailabilityScore = (availability: string) => {
                    const lower = availability.toLowerCase();
                    if (lower.includes('immediate')) return 0;
                    if (lower.includes('negotiable')) return 99;

                    // Extract number for months
                    const match = lower.match(/(\d+)/);
                    if (match) return parseInt(match[1]);

                    return 100; // Fallback for unknown formats
                };

                const scoreA = getAvailabilityScore(a.availability);
                const scoreB = getAvailabilityScore(b.availability);

                return scoreA - scoreB;
            }
        });
    }, [candidates, searchTerm, selectedLocations, selectedSeniority, selectedLanguages, selectedWorkEligibility, salaryRange, sortBy, showFavoritesOnly, favorites]);

    const toggleLocation = (code: string) => {
        setSelectedLocations((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
        );
    };

    const toggleSeniority = (value: string) => {
        setSelectedSeniority((prev) =>
            prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
        );
    };

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
        );
    };

    const toggleWorkEligibility = (value: string) => {
        setSelectedWorkEligibility((prev) =>
            prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
        );
    };

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const newFavorites = prev.includes(id)
                ? prev.filter((f) => f !== id)
                : [...prev, id];
            // Show toast on add
            if (!prev.includes(id)) {
                setToast({ message: 'Added to shortlist', isVisible: true, type: 'success' });
            }
            return newFavorites;
        });
    };

    const openDetailModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setShowDetailModal(true);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('de-CH', {
            style: 'currency',
            currency: 'CHF',
            maximumSignificantDigits: 3,
        }).format(val);
    };

    const formatSalaryRange = (min: number, max: number): string => {
        if (!min && !max) return 'Non-disclosed';
        if (min && max) return `${formatCurrency(min)} – ${formatCurrency(max)}`;
        if (min) return `From ${formatCurrency(min)}`;
        if (max) return `Up to ${formatCurrency(max)}`;
        return 'Non-disclosed';
    };

    // Table column sort handler
    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Sort icon component for table headers
    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig.key !== columnKey) return <div className="w-3 h-3" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-3 h-3" />
            : <ArrowDown className="w-3 h-3" />;
    };

    // Apply table column sorting when in table view
    const sortedCandidates = useMemo(() => {
        if (viewMode !== 'table' || sortConfig.key === null) {
            return filteredCandidates;
        }

        return [...filteredCandidates].sort((a, b) => {
            let aValue: string | number = '';
            let bValue: string | number = '';

            switch (sortConfig.key) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'role':
                    aValue = a.role;
                    bValue = b.role;
                    break;
                case 'experience':
                    aValue = parseInt(a.experience) || 0;
                    bValue = parseInt(b.experience) || 0;
                    break;
                case 'seniority':
                    const seniorityOrder = { 'Junior': 1, 'Mid-level': 2, 'Senior': 3, 'Executive': 4 };
                    aValue = seniorityOrder[a.seniority as keyof typeof seniorityOrder] || 0;
                    bValue = seniorityOrder[b.seniority as keyof typeof seniorityOrder] || 0;
                    break;
                case 'salary':
                    aValue = a.salaryMin;
                    bValue = b.salaryMin;
                    break;
                case 'cantons':
                    aValue = a.cantons[0] || '';
                    bValue = b.cantons[0] || '';
                    break;
                case 'availability':
                    aValue = a.availability;
                    bValue = b.availability;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredCandidates, viewMode, sortConfig]);

    // Choose which candidates to display based on view mode
    const displayCandidates = viewMode === 'table' ? sortedCandidates : filteredCandidates;

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
                        <Badge style="gold">Pre-screened &amp; Personally Interviewed</Badge>
                    </div>
                    <h1 className="mt-6 text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                        Switzerland&apos;s Leading{' '}<br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold)] to-[var(--text-secondary)]">
                            Commodities &amp; Energy Talent Pool
                        </span>
                    </h1>
                    <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-light leading-relaxed">
                        Browse pre‑screened and personally interviewed professionals. Connect directly with candidates ready for their next opportunity.
                    </p>
                </div>
            </div>

            {/* DASHBOARD CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* SIDEBAR FILTERS */}
                    <aside className={`w-full lg:w-72 flex-shrink-0 space-y-4 lg:space-y-0 ${
                            !isSidebarOpen ? 'lg:hidden' : 'lg:block'
                        } lg:animate-in lg:slide-in-from-left-4 lg:fade-in lg:duration-300`}>
                        {/* Mobile Filter Toggle */}
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-surface-2)] border border-[var(--border-strong)] rounded-lg text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.5)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)]"
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
                                            <div className="relative flex items-center flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-slate peer"
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

                            {/* Location Filter */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Preferred Location
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {WORK_LOCATIONS.map((location) => (
                                        <button
                                            key={location.code}
                                            onClick={() => toggleLocation(location.code)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.5)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)] ${selectedLocations.includes(location.code)
                                                ? 'bg-[var(--blue)] border-[var(--blue)] text-white shadow-md'
                                                : 'bg-[var(--bg-surface-2)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--blue)]'
                                                }`}
                                        >
                                            {location.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language Filter */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Languages
                                </h3>
                                <div className="space-y-2.5">
                                    {LANGUAGE_OPTIONS.map((lang) => (
                                        <label
                                            key={lang}
                                            className="flex items-center gap-3 group cursor-pointer select-none"
                                        >
                                            <div className="relative flex items-center flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-slate peer"
                                                    checked={selectedLanguages.includes(lang)}
                                                    onChange={() => toggleLanguage(lang)}
                                                />
                                            </div>
                                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                                {lang}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Work Eligibility Filter */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FileCheck className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Work Eligibility
                                </h3>
                                <div className="space-y-2.5">
                                    {WORK_ELIGIBILITY_OPTIONS.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className="flex items-center gap-3 group cursor-pointer select-none"
                                        >
                                            <div className="relative flex items-center flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-slate peer"
                                                    checked={selectedWorkEligibility.includes(opt.value)}
                                                    onChange={() => toggleWorkEligibility(opt.value)}
                                                />
                                            </div>
                                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                                {opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Salary Filter */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Max Salary (CHF)
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
                                    <div className="flex justify-center mt-3 text-xs text-[var(--text-tertiary)] font-medium font-mono">
                                        <span>{salaryRange[1] / 1000}K{salaryRange[1] === 300000 ? '+' : ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(selectedLocations.length > 0 || selectedSeniority.length > 0 || selectedLanguages.length > 0 || selectedWorkEligibility.length > 0 || searchTerm) && (
                                <button
                                    onClick={() => {
                                        setSelectedLocations([]);
                                        setSelectedSeniority([]);
                                        setSelectedLanguages([]);
                                        setSelectedWorkEligibility([]);
                                        setSearchTerm('');
                                        setSalaryRange([0, 300000]);
                                    }}
                                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-colors border-b border-transparent hover:border-[var(--text-primary)] pb-0.5 w-max focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.5)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)] rounded px-1"
                                >
                                    <X className="w-3 h-3" /> Clear all filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* RESULTS GRID */}
                    <main className="flex-1 overflow-hidden transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 pb-4 border-b border-[var(--border-subtle)] gap-4">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Candidates{' '}
                                <span className="text-[var(--text-tertiary)] font-light ml-2 text-lg">
                                    {displayCandidates.length} results
                                </span>
                            </h2>

                            <div className="flex items-center gap-3">
                                {/* Shortlist Toggle */}
                                {favorites.length > 0 && (
                                    <button
                                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm font-medium ${
                                            showFavoritesOnly
                                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                                : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                    >
                                        <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                                        <span>Shortlist ({favorites.length})</span>
                                    </button>
                                )}

                                {/* Sidebar Toggle */}
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className={`hidden lg:flex p-2 rounded-lg border transition-colors items-center gap-2 text-sm font-medium ${
                                        isSidebarOpen
                                            ? 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            : 'bg-[var(--gold)] border-[var(--gold)] text-[var(--bg-root)] shadow-sm'
                                    }`}
                                    title={isSidebarOpen ? "Hide Filters" : "Show Filters"}
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>Filters</span>
                                </button>

                                <div className="hidden lg:block h-6 w-px bg-[var(--border-subtle)] mx-1"></div>

                                {/* View Toggle */}
                                <div className="flex bg-[var(--bg-surface-2)] rounded-lg p-1 border border-[var(--border-subtle)]">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${
                                            viewMode === 'grid'
                                                ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)] shadow-sm'
                                                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                        }`}
                                        title="Grid View"
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-1.5 rounded-md transition-all ${
                                            viewMode === 'table'
                                                ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)] shadow-sm'
                                                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                        }`}
                                        title="Table View"
                                    >
                                        <TableIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Sort Dropdown - Only show in grid view */}
                                {viewMode === 'grid' && (
                                <div className="relative">
                                <button
                                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                    className="flex items-center gap-2 text-sm text-[var(--text-secondary)] group cursor-pointer hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                                >
                                    Sort by: <span className="font-medium text-[var(--text-primary)]">
                                        {sortBy === 'newest' ? 'Newest' : 'Availability'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isSortDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsSortDropdownOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-40 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                                            <button
                                                onClick={() => {
                                                    setSortBy('newest');
                                                    setIsSortDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-surface-2)] transition-colors ${sortBy === 'newest' ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
                                                    }`}
                                            >
                                                Newest
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSortBy('availability');
                                                    setIsSortDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-surface-2)] transition-colors ${sortBy === 'availability' ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
                                                    }`}
                                            >
                                                Availability
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                                )}
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
                        ) : displayCandidates.length === 0 ? (
                            <div className="glass-panel rounded-xl border-dashed p-16 text-center">
                                <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border-subtle)]">
                                    <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
                                </div>
                                <h3 className="text-lg font-medium text-[var(--text-primary)]">No candidates found</h3>
                                <p className="text-[var(--text-secondary)] mt-1 text-sm">
                                    Adjust your filters to broaden your search.
                                </p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className={`grid grid-cols-1 ${!isSidebarOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : ''} gap-6`}>
                                {displayCandidates.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        className="group glass-panel rounded-xl hover:border-[#D4AF37] hover:shadow-[0_4px_30px_rgba(212,175,55,0.2)] transition-all duration-300 relative cursor-pointer flex flex-col"
                                        onClick={() => openDetailModal(candidate)}
                                    >
                                        {/* Favorite Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(candidate.id);
                                            }}
                                            className={`absolute top-4 right-4 p-2 rounded-lg transition-all z-10 ${
                                                favorites.includes(candidate.id)
                                                    ? 'text-red-400 bg-red-500/10'
                                                    : 'text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10'
                                            }`}
                                        >
                                            <Heart className={`w-5 h-5 ${favorites.includes(candidate.id) ? 'fill-current' : ''}`} />
                                        </button>

                                        {/* Card Body */}
                                        <div className="p-6 flex-1">
                                            {/* Header: ID, Seniority, Work Permit, Entry Date */}
                                            <div className="flex flex-wrap items-center gap-2 mb-3 pr-10">
                                                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded">
                                                    {candidate.id}
                                                </span>
                                                <Badge style={candidate.seniority === 'Executive' ? 'gold' : 'default'}>
                                                    {candidate.seniority}
                                                </Badge>
                                                {candidate.workPermit && (
                                                    <Badge style="blue" icon={FileCheck}>
                                                        {WORK_ELIGIBILITY_OPTIONS.find(o => o.value === candidate.workPermit)?.label || candidate.workPermit}
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Added {candidate.entryDate}
                                                </span>
                                            </div>

                                            {/* Role Title */}
                                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[#D4AF37] group-hover:underline decoration-[var(--gold-border)] underline-offset-4 decoration-2 transition-all leading-snug pr-8">
                                                {candidate.role}
                                            </h3>

                                            {/* Highlight Box */}
                                            {candidate.highlight && (
                                                <div className="mb-5 p-3 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--blue-border)]">
                                                    <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                                        &ldquo;{candidate.highlight}&rdquo;
                                                    </span>
                                                </div>
                                            )}

                                            {/* Metadata Grid (2 columns) */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-[var(--text-secondary)] mb-5">
                                                <div className="flex items-center gap-2" title="Experience">
                                                    <Briefcase className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                                                    <span>{candidate.experience}</span>
                                                </div>
                                                <div className="flex items-center gap-2" title="Salary Range">
                                                    <DollarSign className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                                                    <span>{formatSalaryRange(candidate.salaryMin, candidate.salaryMax)}</span>
                                                </div>
                                                <div className="flex items-center gap-2" title="Preferred Location">
                                                    <MapPin className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                                                    <span>{candidate.cantons.map(code => WORK_LOCATIONS.find(c => c.code === code)?.name ?? code).join('; ')}</span>
                                                </div>
                                                <div className="flex items-center gap-2" title="Availability">
                                                    <Clock className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                                                    <span>{candidate.availability}</span>
                                                </div>
                                                {candidate.education && (
                                                    <div className="flex items-center gap-2" title="Education">
                                                        <GraduationCap className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                                                        <span className="truncate">{candidate.education}</span>
                                                    </div>
                                                )}
                                                {candidate.languages && candidate.languages.length > 0 && (
                                                    <div className="flex items-center gap-2" title="Languages">
                                                        <Globe className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                                                        <span>{candidate.languages.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Functional Expertise Badges */}
                                            {candidate.functionalExpertise && candidate.functionalExpertise.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {candidate.functionalExpertise.map((exp) => (
                                                        <Badge key={exp} style="purple" icon={Layers}>
                                                            {exp}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-2">
                                                {candidate.skills.map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="px-2.5 py-1 bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-[var(--text-secondary)] text-xs font-medium rounded hover:border-[var(--gold-border)] hover:text-[var(--text-primary)] transition-colors cursor-default"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="mt-auto pt-4 px-6 pb-6 border-t border-[var(--border-subtle)] flex justify-end">
                                            <Button
                                                variant="primary"
                                                className="w-full sm:w-auto text-xs sm:text-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowContactModal(candidate.id);
                                                }}
                                            >
                                                Request Intro
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* TABLE VIEW */
                            <div className="glass-panel rounded-xl overflow-hidden">
                                <div className="table-scroll">
                                    <table className="min-w-[1400px] w-full divide-y divide-[var(--border-subtle)]">
                                        <thead className="bg-[var(--bg-surface-2)]">
                                            <tr>
                                                {/* Favorite column (no sort) */}
                                                <th className="px-4 py-3 w-10"></th>
                                                {/* Sortable columns */}
                                                {[
                                                    { label: 'ID', key: 'id', sortable: true },
                                                    { label: 'Role', key: 'role', sortable: true },
                                                    { label: 'Highlight', key: 'highlight', sortable: false },
                                                    { label: 'Expertise', key: 'expertise', sortable: false },
                                                    { label: 'Exp.', key: 'experience', sortable: true },
                                                    { label: 'Seniority', key: 'seniority', sortable: true },
                                                    { label: 'Salary', key: 'salary', sortable: true },
                                                    { label: 'Education', key: 'education', sortable: false },
                                                    { label: 'Pref. Location', key: 'cantons', sortable: true },
                                                    { label: 'Work Eligibility', key: 'workPermit', sortable: false },
                                                    { label: 'Availability', key: 'availability', sortable: true },
                                                    { label: 'Languages', key: 'languages', sortable: false },
                                                ].map((col) => (
                                                    <th
                                                        key={col.key}
                                                        onClick={() => col.sortable && requestSort(col.key)}
                                                        className={`px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider select-none group whitespace-nowrap ${
                                                            col.sortable ? 'cursor-pointer hover:bg-[var(--bg-surface-3)] transition-colors' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {col.label}
                                                            {col.sortable && (
                                                                <span className={`text-[var(--text-tertiary)] ${
                                                                    sortConfig.key === col.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                                                                }`}>
                                                                    <SortIcon columnKey={col.key} />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="relative px-4 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-subtle)]">
                                            {displayCandidates.map((candidate) => (
                                                <tr
                                                    key={candidate.id}
                                                    onClick={() => openDetailModal(candidate)}
                                                    className="hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
                                                >
                                                    {/* Favorite */}
                                                    <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => toggleFavorite(candidate.id)}
                                                            className={`text-[var(--text-tertiary)] hover:text-red-400 transition-colors ${
                                                                favorites.includes(candidate.id) ? 'text-red-400' : ''
                                                            }`}
                                                        >
                                                            <Heart className={`w-4 h-4 ${favorites.includes(candidate.id) ? 'fill-current' : ''}`} />
                                                        </button>
                                                    </td>
                                                    {/* ID */}
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className="font-mono text-xs text-[var(--text-tertiary)] bg-[var(--bg-surface-2)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                                                            {candidate.id}
                                                        </span>
                                                    </td>
                                                    {/* Role */}
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm font-bold text-[var(--text-primary)] min-w-[180px]">{candidate.role}</div>
                                                    </td>
                                                    {/* Highlight */}
                                                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)] min-w-[200px] max-w-[250px]">
                                                        <span className="line-clamp-2" title={candidate.highlight || ''}>
                                                            {candidate.highlight || '-'}
                                                        </span>
                                                    </td>
                                                    {/* Expertise */}
                                                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                                                        {candidate.functionalExpertise?.join('; ') || '-'}
                                                    </td>
                                                    {/* Experience */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                                                        {candidate.experience}
                                                    </td>
                                                    {/* Seniority */}
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <Badge style={candidate.seniority === 'Executive' ? 'gold' : 'default'}>
                                                            {candidate.seniority}
                                                        </Badge>
                                                    </td>
                                                    {/* Salary */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                                                        {formatSalaryRange(candidate.salaryMin, candidate.salaryMax)}
                                                    </td>
                                                    {/* Education */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                                                        {candidate.education || '-'}
                                                    </td>
                                                    {/* Location */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                                                        {candidate.cantons.map(code => WORK_LOCATIONS.find(c => c.code === code)?.name ?? code).join('; ')}
                                                    </td>
                                                    {/* Work Eligibility */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                                                        {candidate.workPermit
                                                            ? WORK_ELIGIBILITY_OPTIONS.find(o => o.value === candidate.workPermit)?.label || candidate.workPermit
                                                            : '-'
                                                        }
                                                    </td>
                                                    {/* Availability */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                                                        {candidate.availability}
                                                    </td>
                                                    {/* Languages */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                                                        {candidate.languages?.join('; ') || '-'}
                                                    </td>
                                                    {/* Actions */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowContactModal(candidate.id);
                                                            }}
                                                            className="text-[var(--gold)] hover:text-[var(--text-primary)] font-bold text-xs border border-[var(--gold-border)] hover:border-[var(--gold)] px-3 py-1.5 rounded transition-all"
                                                        >
                                                            Intro
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
                            className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.5)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface-1)] rounded-md p-1"
                            aria-label="Close modal"
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

            {/* Candidate Detail Modal */}
            <CandidateDetailModal
                candidate={selectedCandidate}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedCandidate(null);
                }}
                onRequestIntroduction={(id) => {
                    setShowDetailModal(false);
                    setShowContactModal(id);
                }}
            />

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
}
