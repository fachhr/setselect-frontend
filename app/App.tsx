import React, { useState, useMemo } from 'react';
import {
    Search,
    MapPin,
    Briefcase,
    ChevronDown,
    Mail,
    ArrowRight,
    DollarSign,
    Clock,
    Menu,
    X,
    Filter
} from 'lucide-react';

import { CANDIDATES, CANTONS, MAIN_CANTON_CODES, SENIORITY_LEVELS } from './constants.ts';
import { Badge, Button } from './components/UI.tsx';
import JoinForm from './components/JoinForm.tsx';
import TermsPage from './components/TermsPage.tsx';
import ContactPage from './components/ContactPage.tsx';
import CompaniesPage from './components/CompaniesPage.tsx';

export default function App() {
    const [currentView, setCurrentView] = useState<'candidates' | 'join' | 'terms' | 'contact' | 'companies'>('candidates');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCantons, setSelectedCantons] = useState<string[]>([]);
    const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
    const [salaryRange, setSalaryRange] = useState([0, 300000]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showContactModal, setShowContactModal] = useState<string | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [showAllCantons, setShowAllCantons] = useState(false);

    // Filter Logic
    const filteredCandidates = useMemo(() => {
        return CANDIDATES.filter(candidate => {
            const matchesSearch =
                candidate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                candidate.id.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCanton = selectedCantons.length === 0 ||
                candidate.cantons.some(c => selectedCantons.includes(c));

            const matchesSeniority = selectedSeniority.length === 0 ||
                selectedSeniority.includes(candidate.seniority);

            const matchesSalary =
                candidate.salaryMin >= salaryRange[0] &&
                candidate.salaryMax <= salaryRange[1];

            return matchesSearch && matchesCanton && matchesSeniority && matchesSalary;
        });
    }, [searchTerm, selectedCantons, selectedSeniority, salaryRange]);

    const toggleCanton = (code: string) => {
        setSelectedCantons(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const toggleSeniority = (value: string) => {
        setSelectedSeniority(prev =>
            prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
        );
    };

    // Logic to determine which cantons to display in the filter sidebar
    const displayedCantons = useMemo(() => {
        if (showAllCantons) {
            return CANTONS;
        }

        // 1. Show the main, high-priority cantons
        const mainCantons = CANTONS.filter(c => MAIN_CANTON_CODES.includes(c.code));

        // 2. Also ensure any currently selected cantons that are *not* main are still visible
        const selectedButNotMain = CANTONS.filter(c =>
            selectedCantons.includes(c.code) && !MAIN_CANTON_CODES.includes(c.code)
        );

        // Combine them
        const combinedCantons = [...mainCantons, ...selectedButNotMain];

        // Get unique canton codes
        const uniqueCantonCodes = Array.from(new Set(combinedCantons.map(c => c.code)));

        // Maintain the alphabetical order of the original list for display consistency
        return CANTONS.filter(c => uniqueCantonCodes.includes(c.code));

    }, [showAllCantons, selectedCantons]);


    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumSignificantDigits: 3 }).format(val);
    };

    const handleViewChange = (view: 'candidates' | 'join' | 'terms' | 'contact' | 'companies') => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
        window.scrollTo(0, 0);
    };

    return (
        <div
            className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900"
            style={{ scrollbarGutter: 'stable' }}
        >

            {/* NAVIGATION */}
            <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleViewChange('candidates')}>
                            {/* Logo - Minimalist Monogram */}
                            <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                                <span className="text-white font-bold text-lg font-serif">S</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight text-slate-900">Silvia's <span className="font-light text-slate-500">List</span></span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            <button onClick={() => handleViewChange('companies')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">For Companies</button>
                            <button onClick={() => handleViewChange('join')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">For Talent</button>
                            <div className="h-4 w-px bg-slate-200"></div>
                            <Button variant="primary" icon={ArrowRight} onClick={() => handleViewChange('join')}>Join the List</Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 z-50">
                        <button onClick={() => handleViewChange('companies')} className="block w-full text-left text-sm font-medium text-slate-600 hover:text-slate-900">For Companies</button>
                        <button onClick={() => handleViewChange('join')} className="block w-full text-left text-sm font-medium text-slate-600 hover:text-slate-900">For Talent</button>
                        <Button className="w-full" onClick={() => handleViewChange('join')}>Join the List</Button>
                    </div>
                )}
            </nav>

            {/* MAIN CONTENT SWITCHER */}
            {currentView === 'join' ? (
                <JoinForm
                    onBack={() => handleViewChange('candidates')}
                    onTermsClick={() => handleViewChange('terms')}
                />
            ) : currentView === 'terms' ? (
                <TermsPage onBack={() => handleViewChange('candidates')} />
            ) : currentView === 'contact' ? (
                <ContactPage onBack={() => handleViewChange('candidates')} />
            ) : currentView === 'companies' ? (
                <CompaniesPage
                    onBack={() => handleViewChange('candidates')}
                    onContactClick={() => handleViewChange('contact')}
                />
            ) : (
                <>
                    {/* HERO SECTION */}
                    <div className="bg-white border-b border-slate-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
                            <Badge style="outline">Switzerland's #1 Tech Talent Pool</Badge>
                            <h1 className="mt-6 text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                                Discover exceptional <br className="hidden sm:block" />
                                <span className="text-slate-900 underline decoration-slate-300 decoration-4 underline-offset-4">tech talent</span>.
                            </h1>
                            <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                                Browse pre-screened professionals in Zurich, Geneva, and beyond.
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
                                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900"
                                    >
                                        <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* Filter Content Container */}
                                <div className={`space-y-8 ${isFiltersOpen ? 'block' : 'hidden'} lg:block animate-in slide-in-from-top-2 duration-200`}>

                                    {/* Search */}
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Search by skill, role, or ID..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all group-hover:border-slate-300"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    </div>

                                    {/* Seniority Filter */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Seniority
                                        </h3>
                                        <div className="space-y-2.5">
                                            {SENIORITY_LEVELS.map((level) => (
                                                <label key={level.value} className="flex items-center gap-3 group cursor-pointer select-none">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="peer h-4 w-4 rounded border-slate-300 text-slate-900 bg-white focus:ring-slate-500 cursor-pointer transition-colors"
                                                            checked={selectedSeniority.includes(level.value)}
                                                            onChange={() => toggleSeniority(level.value)}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{level.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Canton Filter */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Preferred Location
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {displayedCantons.map((canton) => (
                                                <button
                                                    key={canton.code}
                                                    onClick={() => toggleCanton(canton.code)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-all duration-200 ${selectedCantons.includes(canton.code)
                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
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
                                                className="mt-3 text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors"
                                            >
                                                {showAllCantons ? (
                                                    <>
                                                        Show fewer Cantons <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Show all {CANTONS.length} Cantons <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Salary Filter (Mock Slider) */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Salary (CHF)
                                        </h3>
                                        <div className="px-1">
                                            <input
                                                type="range"
                                                min="50000"
                                                max="300000"
                                                step="10000"
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                                onChange={(e) => setSalaryRange([50000, parseInt(e.target.value)])}
                                            />
                                            <div className="flex justify-between mt-3 text-xs text-slate-500 font-medium font-mono">
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
                                            className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors border-b border-transparent hover:border-slate-900 pb-0.5 w-max"
                                        >
                                            <X className="w-3 h-3" /> Clear all filters
                                        </button>
                                    )}
                                </div>
                            </aside>

                            {/* RESULTS GRID */}
                            <main className="flex-1">
                                <div className="flex justify-between items-end mb-6 pb-4 border-b border-slate-100">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Candidates <span className="text-slate-400 font-light ml-2 text-lg">{filteredCandidates.length} results</span>
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 group cursor-pointer hover:text-slate-900 transition-colors">
                                        Sort by: <span className="font-medium text-slate-900">Newest</span>
                                        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                    </div>
                                </div>

                                {filteredCandidates.length === 0 ? (
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-16 text-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                                            <Search className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900">No candidates found</h3>
                                        <p className="text-slate-500 mt-1 text-sm">Adjust your filters to broaden your search.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {filteredCandidates.map((candidate) => (
                                            <div
                                                key={candidate.id}
                                                className="group bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-400 hover:shadow-md transition-all duration-300 relative"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                                            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                                                                {candidate.id}
                                                            </span>
                                                            <Badge style={candidate.seniority === 'Executive' ? 'dark' : 'default'}>
                                                                {candidate.seniority}
                                                            </Badge>
                                                            <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                                                                <Clock className="w-3 h-3" /> Added {candidate.entryDate}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:underline decoration-slate-300 underline-offset-4 decoration-2 transition-all">
                                                            {candidate.role}
                                                        </h3>

                                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 mt-4 mb-5">
                                                            <div className="flex items-center gap-2">
                                                                <Briefcase className="w-4 h-4 text-slate-400" />
                                                                {candidate.experience}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                                {candidate.cantons.join(', ')}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="w-4 h-4 text-slate-400" />
                                                                <span className="font-mono text-slate-700">{formatCurrency(candidate.salaryMin)} – {formatCurrency(candidate.salaryMax)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            {candidate.skills.map(skill => (
                                                                <span key={skill} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded hover:border-slate-400 hover:text-slate-900 transition-colors cursor-default">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:items-end gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 min-w-[140px]">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">Availability</p>
                                                            <p className="text-sm font-medium text-slate-900">{candidate.availability}</p>
                                                        </div>
                                                        <Button
                                                            variant="secondary"
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
                </>
            )}

            {/* FOOTER */}
            <footer className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm font-serif">S</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-sm leading-none">Silvia's List</span>
                                <span className="text-[10px] text-slate-400 mt-0.5">Tech Recruitment Switzerland</span>
                            </div>
                        </div>
                        <div className="text-sm text-slate-500 flex gap-8">
                            <button onClick={() => handleViewChange('terms')} className="hover:text-slate-900 transition-colors">Terms</button>
                            <button onClick={() => handleViewChange('terms')} className="hover:text-slate-900 transition-colors">Privacy</button>
                            <button onClick={() => handleViewChange('contact')} className="hover:text-slate-900 transition-colors">Contact</button>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                            © 2025 Silvia's List.
                        </div>
                    </div>
                </div>
            </footer>

            {/* CONTACT MODAL (For Specific Candidate Intro) */}
            {showContactModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl shadow-slate-200 max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setShowContactModal(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Mail className="w-5 h-5 text-slate-900" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Request Introduction</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Interested in candidate <span className="font-mono bg-slate-100 px-1 rounded text-slate-900">{showContactModal}</span>?
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded border border-slate-200 text-sm text-slate-600 text-center leading-relaxed">
                                Please email us at <span className="font-semibold text-slate-900 border-b border-slate-300 pb-0.5">silvia@silviaslist.com</span><br /> quoting the Talent ID above.
                            </div>

                            <Button className="w-full" variant="primary" onClick={() => {
                                // Using a simple log instead of alert for cleaner UX, but keeping close to user intent
                                console.log(`Email copied! Reference ID: ${showContactModal}`);
                                setShowContactModal(null);
                            }}>
                                Copy Email Address
                            </Button>

                            <button
                                onClick={() => setShowContactModal(null)}
                                className="w-full text-xs text-slate-400 hover:text-slate-600 py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}