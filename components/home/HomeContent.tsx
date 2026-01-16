'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search,
    MapPin,
    Briefcase,
    ChevronDown,
    DollarSign,
    Clock,
    Filter,
    X,
    LayoutGrid,
    Table as TableIcon,
    ArrowUp,
    ArrowDown,
    Heart,
    Globe,
    FileCheck,
    GraduationCap,
    Check,
    Maximize2,
    Minimize2,
    ArrowUpDown
} from 'lucide-react';
import { WORK_LOCATIONS, SENIORITY_LEVELS, WORK_ELIGIBILITY_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/formOptions';
import { Badge, Button, Toast, CustomScrollbar } from '@/components/ui';
import { Candidate } from '@/types/talentPool';
import { CandidateDetailModal } from './CandidateDetailModal';
import { useZenMode } from '@/contexts/ZenModeContext';

// Multi-Select Filter Component for Table View
interface MultiSelectFilterProps {
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({ options, selected, onChange, placeholder = 'All' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter(item => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const displayText = selected.length === 0
        ? placeholder
        : selected.length === 1
            ? options.find(o => o.value === selected[0])?.label || selected[0]
            : `${selected.length} selected`;

    return (
        <div className="relative" ref={containerRef}>
            <button
                ref={buttonRef}
                onClick={() => {
                    if (!isOpen && buttonRef.current) {
                        const rect = buttonRef.current.getBoundingClientRect();
                        setDropdownPosition({
                            top: rect.bottom + 4,
                            left: rect.left
                        });
                    }
                    setIsOpen(!isOpen);
                }}
                className={`w-full text-left text-xs border rounded py-1 pl-2 pr-6 relative focus:outline-none focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal truncate h-7 flex items-center transition-colors
                    ${selected.length > 0
                        ? 'bg-[var(--blue-dim)] border-[var(--blue)] text-[var(--text-primary)]'
                        : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-tertiary)]'
                    }`}
            >
                {displayText}
                <ChevronDown className="w-3 h-3 absolute right-1.5 top-2 text-[var(--text-tertiary)]" />
            </button>

            {isOpen && (
                <div
                    className="fixed w-48 bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                >
                    <div className="p-1 max-h-60 overflow-y-auto">
                        {options.map((option) => {
                            const isSelected = selected.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => toggleOption(option.value)}
                                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--bg-surface-2)] rounded cursor-pointer select-none"
                                >
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected
                                            ? 'bg-[var(--blue)] border-[var(--blue)]'
                                            : 'border-[var(--border-strong)] bg-[var(--bg-surface-1)]'
                                        }`}>
                                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className={`text-xs text-left flex-1 ${isSelected ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                                        {option.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {selected.length > 0 && (
                        <div className="border-t border-[var(--border-subtle)] p-1">
                            <button
                                onClick={() => { onChange([]); setIsOpen(false); }}
                                className="w-full text-center text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] py-1.5 transition-colors border-b border-transparent hover:border-[var(--text-primary)]"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

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
    profile_bio?: string | null;
    short_summary?: string | null;
    previous_roles?: { role: string; duration: string }[] | null;
}

export default function HomeContent() {
    const { isZenMode, toggleZenMode } = useZenMode();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedWorkEligibility, setSelectedWorkEligibility] = useState<string[]>([]);
    const [salaryFilter, setSalaryFilter] = useState<{ min: number | null; max: number | null }>({
        min: null,
        max: null
    });
    const [sortBy, setSortBy] = useState<'newest' | 'availability'>('newest');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    // Auto-reset shortlist view when all favorites are removed
    useEffect(() => {
        if (favorites.length === 0 && showFavoritesOnly) {
            setShowFavoritesOnly(false);
        }
    }, [favorites.length, showFavoritesOnly]);

    // Table column filters state
    const [tableFilters, setTableFilters] = useState<{
        id: string;
        role: string;
        previousRoles: string;
        highlight: string;
        expertise: string;
        experience: string;
        seniority: string[];
        salary: string;
        education: string;
        cantons: string[];
        workPermit: string[];
        availability: string;
        languages: string[];
        entryDate: string;
    }>({
        id: '', role: '', previousRoles: '', highlight: '', expertise: '', experience: '',
        seniority: [], salary: '', education: '', cantons: [],
        workPermit: [], availability: '', languages: [], entryDate: ''
    });

    const updateTableFilter = (key: keyof typeof tableFilters, value: string | string[]) => {
        setTableFilters(prev => ({ ...prev, [key]: value }));
    };

    // Format helpers (defined early for use in filter logic)
    const formatCurrency = (val: number) => {
        const k = Math.round(val / 1000);
        return `CHF ${k}K`;
    };

    const formatSalaryRange = (min: number, max: number): string => {
        if (!min && !max) return '-';
        if (min && max) return `CHF ${Math.round(min / 1000)}K - ${Math.round(max / 1000)}K`;
        if (min) return `From ${formatCurrency(min)}`;
        if (max) return `Up to ${formatCurrency(max)}`;
        return '-';
    };

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
                        functionalExpertise: c.functional_expertise || [],
                        profileBio: c.profile_bio || undefined,
                        shortSummary: c.short_summary || undefined,
                        previousRoles: c.previous_roles || undefined
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

            const lowerTerm = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || (
                candidate.role.toLowerCase().includes(lowerTerm) ||
                candidate.id.toLowerCase().includes(lowerTerm) ||
                candidate.skills.some((s) => s.toLowerCase().includes(lowerTerm)) ||
                (candidate.highlight?.toLowerCase().includes(lowerTerm) ?? false) ||
                (candidate.functionalExpertise?.some((f) => f.toLowerCase().includes(lowerTerm)) ?? false) ||
                (candidate.education?.toLowerCase().includes(lowerTerm) ?? false) ||
                candidate.experience.toLowerCase().includes(lowerTerm) ||
                (candidate.seniority?.toLowerCase().includes(lowerTerm) ?? false) ||
                (candidate.workPermit?.toLowerCase().includes(lowerTerm) ?? false) ||
                (candidate.languages?.some((l) => l.toLowerCase().includes(lowerTerm)) ?? false) ||
                (candidate.cantons?.some((c) =>
                    c.toLowerCase().includes(lowerTerm) ||
                    WORK_LOCATIONS.find((k) => k.code === c)?.name.toLowerCase().includes(lowerTerm)
                ) ?? false) ||
                candidate.availability.toLowerCase().includes(lowerTerm) ||
                formatSalaryRange(candidate.salaryMin, candidate.salaryMax).toLowerCase().includes(lowerTerm)
            );

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

            const matchesSalary = (() => {
                const { min: filterMin, max: filterMax } = salaryFilter;

                // No filter = show all
                if (filterMin === null && filterMax === null) return true;

                // Candidate has no salary data = include (maximize recall)
                if (candidate.salaryMin == null && candidate.salaryMax == null) return true;

                // Normalize ranges (handle partial data)
                const candMin = candidate.salaryMin ?? 0;
                const candMax = candidate.salaryMax ?? Infinity;
                const fMin = filterMin ?? 0;
                const fMax = filterMax ?? Infinity;

                // Range overlap: candMin <= fMax && candMax >= fMin
                return candMin <= fMax && candMax >= fMin;
            })();

            // Table column filters (only apply in table view)
            const matchesTableFilters = viewMode !== 'table' || Object.entries(tableFilters).every(([key, filterValue]) => {
                // Skip if filter is empty
                if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true;

                // Handle multi-select array filters
                if (Array.isArray(filterValue)) {
                    if (key === 'seniority') {
                        return filterValue.includes(candidate.seniority);
                    }
                    if (key === 'cantons') {
                        return candidate.cantons.some(c => filterValue.includes(c));
                    }
                    if (key === 'workPermit') {
                        return filterValue.includes(candidate.workPermit || '');
                    }
                    if (key === 'languages') {
                        return candidate.languages?.some(l => filterValue.includes(l)) || false;
                    }
                    return true;
                }

                // Handle text filters
                const searchVal = filterValue.toLowerCase();

                if (key === 'id') return candidate.id.toLowerCase().includes(searchVal);
                if (key === 'role') return candidate.role.toLowerCase().includes(searchVal);
                if (key === 'previousRoles') {
                    // Search through previous roles (both role and duration)
                    if (!candidate.previousRoles || candidate.previousRoles.length === 0) return false;
                    return candidate.previousRoles.some(r =>
                        r.role.toLowerCase().includes(searchVal) ||
                        r.duration.toLowerCase().includes(searchVal)
                    );
                }
                if (key === 'highlight') return (candidate.highlight || '').toLowerCase().includes(searchVal);
                if (key === 'expertise') return candidate.functionalExpertise?.some(e => e.toLowerCase().includes(searchVal)) || false;
                if (key === 'experience') return candidate.experience.toLowerCase().includes(searchVal);
                if (key === 'education') return (candidate.education || '').toLowerCase().includes(searchVal);
                if (key === 'availability') return candidate.availability.toLowerCase().includes(searchVal);
                if (key === 'entryDate') return candidate.entryDate.toLowerCase().includes(searchVal);
                if (key === 'salary') {
                    const val = searchVal.trim();
                    if (!val) return true;

                    // Parse "min-max", "-max", "min-", or just "min"
                    const match = val.match(/^(\d+)?\s*-\s*(\d+)?$/);
                    const tableFilterMin = match ? (match[1] ? parseInt(match[1]) : null) : parseInt(val) || null;
                    const tableFilterMax = match ? (match[2] ? parseInt(match[2]) : null) : null;

                    if (tableFilterMin === null && tableFilterMax === null) {
                        // Text search fallback
                        return formatSalaryRange(candidate.salaryMin, candidate.salaryMax).toLowerCase().includes(val);
                    }

                    if (candidate.salaryMin == null && candidate.salaryMax == null) return true;

                    const candMin = candidate.salaryMin ?? 0;
                    const candMax = candidate.salaryMax ?? Infinity;
                    const fMin = tableFilterMin ?? 0;
                    const fMax = tableFilterMax ?? Infinity;

                    return candMin <= fMax && candMax >= fMin;
                }

                return true;
            });

            return matchesFavorites && matchesSearch && matchesLocation && matchesSeniority && matchesLanguage && matchesWorkEligibility && matchesSalary && matchesTableFilters;
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
    }, [candidates, searchTerm, selectedLocations, selectedSeniority, selectedLanguages, selectedWorkEligibility, salaryFilter, sortBy, showFavoritesOnly, favorites, tableFilters, viewMode]);

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
        setFavorites((prev) =>
            prev.includes(id)
                ? prev.filter((f) => f !== id)
                : [...prev, id]
        );
    };

    const handleRequestIntro = (candidateId: string) => {
        const candidate = candidates.find(c => c.id === candidateId);
        const subject = `Introduction Request: ${candidateId}`;
        const body = `Hello,\n\nI would like to request an introduction to the following candidate:\n\nID: ${candidateId}\nRole: ${candidate?.role || ''}\n\nBest regards,`;

        window.location.href = `mailto:hello@setberry.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const openDetailModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setShowDetailModal(true);
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
                case 'entryDate':
                    aValue = new Date(a.entryDate).getTime();
                    bValue = new Date(b.entryDate).getTime();
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
            {/* HERO SECTION - Hidden in Zen Mode */}
            {!isZenMode && (
                <div className="bg-[var(--bg-root)] border-b border-[var(--border-subtle)] relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--secondary)] opacity-[0.08] blur-[100px] rounded-full"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary)] opacity-[0.06] blur-[120px] rounded-full"></div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center relative z-10">
                        <div className="inline-block mb-6">
                            <Badge style="gold">Pre-screened &amp; Selected Talent</Badge>
                        </div>
                        <h1 className="font-title mt-6 text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                            Switzerland&apos;s Leading{' '}<br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">
                                Energy &amp; Commodities Talent Pool
                            </span>
                            <span className="block mt-4 text-lg sm:text-xl font-medium text-[var(--secondary)]">
                                Coming Soon
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-light leading-relaxed">
                            Browse pre‑screened and selected talent. Within just a few clicks, get contact information of the candidates you like.
                        </p>
                    </div>
                </div>
            )}

            {/* DASHBOARD CONTENT AREA */}
            <div className={`w-full transition-all duration-300 ${isZenMode
                    ? 'px-4 sm:px-6 lg:px-8 py-8'
                    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'
                }`}>
                {/* Header */}
                <div className="mb-6 pb-4 border-b border-[var(--border-subtle)]">
                    {/* Row 1: Title + View Toggle + Zen Mode (+ Desktop controls) */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                            Candidates{' '}
                            <span className="text-[var(--text-tertiary)] font-light ml-2 text-lg">
                                {displayCandidates.length} results
                            </span>
                        </h2>

                        <div className="flex items-center gap-3">
                            {/* Mobile only: Shortlist, Filters, Sort (icon buttons) */}
                            <div className="flex sm:hidden items-center gap-2">
                                {favorites.length > 0 && (
                                    <button
                                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                        className={`p-2 rounded-lg border transition-colors ${showFavoritesOnly
                                                ? 'bg-[var(--error-dim)] border-[var(--error-border)] text-[var(--error)]'
                                                : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                                            }`}
                                    >
                                        <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                                    </button>
                                )}
                                {viewMode === 'grid' && !isZenMode && (
                                    <button
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className={`p-2 rounded-lg border transition-colors ${isSidebarOpen
                                                ? 'bg-[var(--gold)] border-[var(--gold)] text-[var(--bg-root)] shadow-sm'
                                                : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                                            }`}
                                    >
                                        <Filter className="w-4 h-4" />
                                    </button>
                                )}
                                {viewMode === 'grid' && (
                                    <div className="relative">
                                        <select
                                            onChange={(e) => setSortBy(e.target.value as 'newest' | 'availability')}
                                            value={sortBy}
                                            className="appearance-none w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="availability">Availability</option>
                                        </select>
                                        <div className="p-2 rounded-lg border bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)]">
                                            <ArrowUpDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Desktop only: Shortlist, Filters, Sort */}
                            <div className="hidden sm:flex items-center gap-3">
                                {/* Shortlist Toggle */}
                                {favorites.length > 0 && (
                                    <button
                                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors text-sm font-medium ${showFavoritesOnly
                                                ? 'bg-[var(--error-dim)] border-[var(--error-border)] text-[var(--error)]'
                                                : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                                        <span>Shortlist</span>
                                    </button>
                                )}

                                {/* Filters - Only in grid view, hidden in Zen Mode */}
                                {viewMode === 'grid' && !isZenMode && (
                                    <button
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className={`flex p-2 rounded-lg border transition-colors items-center gap-2 text-sm font-medium ${isSidebarOpen
                                                ? 'bg-[var(--gold)] border-[var(--gold)] text-[var(--bg-root)] shadow-sm'
                                                : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                        title={isSidebarOpen ? "Hide Filters" : "Show Filters"}
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>Filters</span>
                                    </button>
                                )}

                                {/* Sort Dropdown - Only in grid view */}
                                {viewMode === 'grid' && (
                                    <div className="relative group">
                                        <select
                                            onChange={(e) => setSortBy(e.target.value as 'newest' | 'availability')}
                                            value={sortBy}
                                            className="appearance-none pl-8 pr-8 py-2 rounded-lg border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface-2)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all cursor-pointer"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="availability">Availability</option>
                                        </select>
                                        <ArrowUpDown className="w-4 h-4 text-[var(--text-tertiary)] absolute left-2.5 top-2.5 pointer-events-none" />
                                        <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] absolute right-2.5 top-2.5 pointer-events-none" />
                                    </div>
                                )}
                            </div>

                            {/* View Toggle - Desktop only */}
                            <div className="hidden md:flex bg-[var(--bg-surface-2)] rounded-lg p-1 border border-[var(--border-subtle)]">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                                            ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)] shadow-sm'
                                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                        }`}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'table'
                                            ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)] shadow-sm'
                                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                        }`}
                                    title="Table View"
                                >
                                    <TableIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Zen Mode / Full Screen Toggle - Desktop only */}
                            <button
                                onClick={toggleZenMode}
                                className={`hidden md:block p-2.5 rounded-lg border transition-colors ${isZenMode
                                        ? 'bg-[var(--gold)] border-[var(--gold)] text-[var(--bg-root)] shadow-sm'
                                        : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                                title={isZenMode ? 'Exit Full Screen' : 'Enter Full Screen'}
                            >
                                {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* SIDEBAR FILTERS - Only show in grid view when open, hidden in Zen Mode */}
                    {viewMode === 'grid' && !isZenMode && isSidebarOpen && (
                        <aside className="w-full lg:w-72 flex-shrink-0 space-y-8 animate-in slide-in-from-left-4 fade-in duration-300">
                            {/* Search */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search candidates..."
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
                                            className={`px-3 py-1.5 text-xs font-medium rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)] ${selectedLocations.includes(location.code)
                                                ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-md'
                                                : 'bg-[var(--bg-surface-2)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--secondary)]'
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
                                    <DollarSign className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Salary (CHF)
                                </h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full text-xs border border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1.5 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] h-8"
                                        value={salaryFilter.min ?? ''}
                                        onChange={(e) => setSalaryFilter(prev => ({
                                            ...prev,
                                            min: e.target.value ? parseInt(e.target.value) : null
                                        }))}
                                    />
                                    <span className="text-[var(--text-tertiary)] text-xs">–</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full text-xs border border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1.5 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] h-8"
                                        value={salaryFilter.max ?? ''}
                                        onChange={(e) => setSalaryFilter(prev => ({
                                            ...prev,
                                            max: e.target.value ? parseInt(e.target.value) : null
                                        }))}
                                    />
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(selectedLocations.length > 0 || selectedSeniority.length > 0 || selectedLanguages.length > 0 || selectedWorkEligibility.length > 0 || searchTerm || salaryFilter.min !== null || salaryFilter.max !== null) && (
                                <button
                                    onClick={() => {
                                        setSelectedLocations([]);
                                        setSelectedSeniority([]);
                                        setSelectedLanguages([]);
                                        setSelectedWorkEligibility([]);
                                        setSearchTerm('');
                                        setSalaryFilter({ min: null, max: null });
                                    }}
                                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-colors border-b border-transparent hover:border-[var(--text-primary)] pb-0.5 w-max"
                                >
                                    <X className="w-3 h-3" /> Clear all filters
                                </button>
                            )}
                        </aside>
                    )}

                    {/* RESULTS */}
                    <main className="flex-1 overflow-hidden transition-all duration-300">
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
                        ) : displayCandidates.length === 0 && viewMode === 'grid' ? (
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
                            <div className={`grid grid-cols-1 ${isZenMode
                                    ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    : !isSidebarOpen
                                        ? 'lg:grid-cols-2 xl:grid-cols-3'
                                        : ''
                                } gap-6`}>
                                {displayCandidates.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        className="group glass-panel rounded-xl hover:border-[var(--secondary)] hover:shadow-[0_4px_30px_rgba(0,180,216,0.2)] transition-all duration-300 relative cursor-pointer flex flex-col"
                                        onClick={() => openDetailModal(candidate)}
                                    >
                                        {/* Favorite Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(candidate.id);
                                            }}
                                            className={`absolute top-4 right-4 p-2 rounded-lg transition-all z-10 ${favorites.includes(candidate.id)
                                                    ? 'text-[var(--error)]'
                                                    : 'text-[var(--text-tertiary)] hover:text-[var(--error)]'
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
                                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--primary-hover)] group-hover:underline decoration-[var(--blue-border)] underline-offset-4 decoration-2 transition-all leading-snug pr-8">
                                                {candidate.role}
                                            </h3>

                                            {/* Previous Roles - Anonymized job history */}
                                            {candidate.previousRoles && candidate.previousRoles.length > 0 && (
                                                <div className="mb-4 mt-2">
                                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5 block">
                                                        Previously
                                                    </span>
                                                    <div className="flex flex-col gap-1">
                                                        {candidate.previousRoles.map((roleObj, idx) => (
                                                            <div key={idx} className="flex items-center justify-between gap-2 text-sm text-[var(--text-secondary)]">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)] flex-shrink-0"></span>
                                                                    <span className="leading-snug truncate">{roleObj.role}</span>
                                                                </div>
                                                                {roleObj.duration && (
                                                                    <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">{roleObj.duration}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Highlight Box - Key Achievement Quote */}
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

                                            {/* Functional Expertise + Skills Pills */}
                                            <div className="flex flex-wrap gap-2">
                                                {candidate.functionalExpertise?.map((exp) => (
                                                    <span
                                                        key={`exp-${exp}`}
                                                        className="inline-flex items-center px-2.5 py-1 bg-[var(--expertise-dim)] border border-[var(--expertise-border)] text-[var(--expertise)] text-xs font-medium rounded-md"
                                                    >
                                                        {exp}
                                                    </span>
                                                ))}
                                                {candidate.skills.map((skill) => (
                                                    <span
                                                        key={`skill-${skill}`}
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
                                                    handleRequestIntro(candidate.id);
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
                                <CustomScrollbar>
                                    <table className="min-w-[2100px] w-full divide-y divide-[var(--border-subtle)] table-fixed">
                                        <thead className="bg-[var(--bg-surface-2)]">
                                            <tr>
                                                {/* Favorite column (no sort) */}
                                                <th className="px-4 py-3 w-10"></th>
                                                {/* Sortable columns */}
                                                {[
                                                    { label: 'ID', key: 'id', sortable: true, width: 'w-20' },
                                                    { label: 'Role', key: 'role', sortable: true, width: 'w-56' },
                                                    { label: 'Years Exp.', key: 'experience', sortable: true, width: 'w-24' },
                                                    { label: 'Expertise', key: 'expertise', sortable: false, width: 'w-52' },
                                                    { label: 'Pref. Location', key: 'cantons', sortable: true, width: 'w-36' },
                                                    { label: 'Salary', key: 'salary', sortable: true, width: 'w-40' },
                                                    { label: 'Previous Roles', key: 'previousRoles', sortable: false, width: 'w-72' },
                                                    { label: 'Highlight', key: 'highlight', sortable: false, width: 'w-72' },
                                                    { label: 'Education', key: 'education', sortable: false, width: 'w-64' },
                                                    { label: 'Work Eligibility', key: 'workPermit', sortable: false, width: 'w-36' },
                                                    { label: 'Availability', key: 'availability', sortable: true, width: 'w-28' },
                                                    { label: 'Languages', key: 'languages', sortable: false, width: 'w-28' },
                                                    { label: 'Added', key: 'entryDate', sortable: true, width: 'w-24' },
                                                ].map((col) => (
                                                    <th
                                                        key={col.key}
                                                        onClick={() => col.sortable && requestSort(col.key)}
                                                        className={`px-4 py-3 ${col.width} text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider select-none group whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:bg-[var(--bg-surface-3)] transition-colors' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {col.label}
                                                            {col.sortable && (
                                                                <span className={`text-[var(--text-tertiary)] ${sortConfig.key === col.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                                                                    }`}>
                                                                    <SortIcon columnKey={col.key} />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="relative px-4 py-3 w-20">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                            {/* Filter Row */}
                                            <tr className="bg-[var(--bg-surface-2)] border-t border-[var(--border-subtle)]">
                                                <th className="px-4 py-2">
                                                    <Filter className="w-3 h-3 text-[var(--text-tertiary)]" />
                                                </th>
                                                {/* ID */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="ID"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.id}
                                                        onChange={(e) => updateTableFilter('id', e.target.value)}
                                                    />
                                                </th>
                                                {/* Role */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Role"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.role}
                                                        onChange={(e) => updateTableFilter('role', e.target.value)}
                                                    />
                                                </th>
                                                {/* Experience */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Exp"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.experience}
                                                        onChange={(e) => updateTableFilter('experience', e.target.value)}
                                                    />
                                                </th>
                                                {/* Expertise */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Expertise"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.expertise}
                                                        onChange={(e) => updateTableFilter('expertise', e.target.value)}
                                                    />
                                                </th>
                                                {/* Location - MultiSelect */}
                                                <th className="px-4 py-2">
                                                    <MultiSelectFilter
                                                        options={WORK_LOCATIONS.map(l => ({ value: l.code, label: l.name }))}
                                                        selected={tableFilters.cantons}
                                                        onChange={(val) => updateTableFilter('cantons', val)}
                                                        placeholder="All"
                                                    />
                                                </th>
                                                {/* Salary */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Min"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.salary}
                                                        onChange={(e) => updateTableFilter('salary', e.target.value)}
                                                    />
                                                </th>
                                                {/* Previous Roles */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Search"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.previousRoles}
                                                        onChange={(e) => updateTableFilter('previousRoles', e.target.value)}
                                                    />
                                                </th>
                                                {/* Highlight */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Search"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.highlight}
                                                        onChange={(e) => updateTableFilter('highlight', e.target.value)}
                                                    />
                                                </th>
                                                {/* Education */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Degree"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.education}
                                                        onChange={(e) => updateTableFilter('education', e.target.value)}
                                                    />
                                                </th>
                                                {/* Work Eligibility - MultiSelect */}
                                                <th className="px-4 py-2">
                                                    <MultiSelectFilter
                                                        options={WORK_ELIGIBILITY_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                                                        selected={tableFilters.workPermit}
                                                        onChange={(val) => updateTableFilter('workPermit', val)}
                                                        placeholder="All"
                                                    />
                                                </th>
                                                {/* Availability */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Notice"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.availability}
                                                        onChange={(e) => updateTableFilter('availability', e.target.value)}
                                                    />
                                                </th>
                                                {/* Languages - MultiSelect */}
                                                <th className="px-4 py-2">
                                                    <MultiSelectFilter
                                                        options={LANGUAGE_OPTIONS.map(l => ({ value: l, label: l }))}
                                                        selected={tableFilters.languages}
                                                        onChange={(val) => updateTableFilter('languages', val)}
                                                        placeholder="All"
                                                    />
                                                </th>
                                                {/* Added Date */}
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Date"
                                                        className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface-1)] text-[var(--text-primary)] rounded py-1 px-2 focus:ring-1 focus:ring-[var(--blue)] focus:border-[var(--blue)] font-normal placeholder:text-[var(--text-tertiary)] h-7"
                                                        value={tableFilters.entryDate}
                                                        onChange={(e) => updateTableFilter('entryDate', e.target.value)}
                                                    />
                                                </th>
                                                {/* Actions column - empty */}
                                                <th className="px-4 py-2"></th>
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
                                                            className={`text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors ${favorites.includes(candidate.id) ? 'text-[var(--error)]' : ''
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
                                                    <td className="px-4 py-4 overflow-hidden">
                                                        <div className="text-xs font-bold text-[var(--text-primary)] break-words">{candidate.role}</div>
                                                    </td>
                                                    {/* Experience */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-xs text-[var(--text-secondary)]">
                                                        {candidate.experience}
                                                    </td>
                                                    {/* Expertise */}
                                                    <td className="px-4 py-4 text-xs text-[var(--text-secondary)] overflow-hidden">
                                                        <span className="break-words">
                                                            {candidate.functionalExpertise?.join('; ') || '-'}
                                                        </span>
                                                    </td>
                                                    {/* Location */}
                                                    <td className="px-4 py-4 text-xs text-[var(--text-secondary)] overflow-hidden">
                                                        <span className="break-words">
                                                            {candidate.cantons.map(code => WORK_LOCATIONS.find(c => c.code === code)?.name ?? code).join('; ')}
                                                        </span>
                                                    </td>
                                                    {/* Salary */}
                                                    <td className="px-4 py-4 text-xs text-[var(--text-secondary)] overflow-hidden">
                                                        <span className="break-words">{formatSalaryRange(candidate.salaryMin, candidate.salaryMax)}</span>
                                                    </td>
                                                    {/* Previous Roles */}
                                                    <td className="px-4 py-4 text-xs text-[var(--text-secondary)] overflow-hidden">
                                                        {candidate.previousRoles && candidate.previousRoles.length > 0 ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                {candidate.previousRoles.slice(0, 2).map((r, idx) => (
                                                                    <div key={idx} className="flex items-center gap-1.5 truncate">
                                                                        <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)] flex-shrink-0"></span>
                                                                        <span className="truncate">{r.role}</span>
                                                                        {r.duration && <span className="text-[var(--text-tertiary)] whitespace-nowrap">({r.duration})</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span>-</span>
                                                        )}
                                                    </td>
                                                    {/* Highlight */}
                                                    <td className="px-4 py-4 text-xs text-[var(--text-secondary)] overflow-hidden">
                                                        <span className="break-words line-clamp-3">
                                                            {candidate.highlight || '-'}
                                                        </span>
                                                    </td>
                                                    {/* Education */}
                                                    <td className="px-4 py-4 text-xs text-[var(--text-secondary)] overflow-hidden">
                                                        <span className="break-words">
                                                            {candidate.education || '-'}
                                                        </span>
                                                    </td>
                                                    {/* Work Eligibility */}
                                                    <td className="px-4 py-4 text-xs text-[var(--text-secondary)] overflow-hidden">
                                                        <span className="break-words">
                                                            {candidate.workPermit
                                                                ? WORK_ELIGIBILITY_OPTIONS.find(o => o.value === candidate.workPermit)?.label || candidate.workPermit
                                                                : '-'
                                                            }
                                                        </span>
                                                    </td>
                                                    {/* Availability */}
                                                    <td className="px-4 py-4 text-xs text-[var(--text-secondary)] overflow-hidden">
                                                        <span className="break-words">{candidate.availability}</span>
                                                    </td>
                                                    {/* Languages */}
                                                    <td className="px-4 py-4 text-xs text-[var(--text-secondary)] overflow-hidden">
                                                        <span className="break-words">
                                                            {candidate.languages?.join('; ') || '-'}
                                                        </span>
                                                    </td>
                                                    {/* Added Date */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-xs text-[var(--text-secondary)]">
                                                        {candidate.entryDate}
                                                    </td>
                                                    {/* Actions */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRequestIntro(candidate.id);
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
                                </CustomScrollbar>
                                {/* Empty state - outside scroll container for proper centering */}
                                {displayCandidates.length === 0 && (
                                    <div className="p-16 text-center border-t border-[var(--border-subtle)]">
                                        <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border-subtle)]">
                                            <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
                                        </div>
                                        <h3 className="text-lg font-medium text-[var(--text-primary)]">No candidates found</h3>
                                        <p className="text-[var(--text-secondary)] mt-1 text-sm">
                                            Adjust your filters to broaden your search.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

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
                    handleRequestIntro(id);
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
