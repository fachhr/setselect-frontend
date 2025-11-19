'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Briefcase, ChevronDown, Mail, ArrowRight,
  DollarSign, Clock, Menu, X, Loader2
} from 'lucide-react';
import { Badge, Button } from '@/components/ui/DesignSystem';
import { AnonymizedTalentProfile, TalentPoolListResponse } from '@/types/talentPool';
import {
  formatEntryDate,
  formatYearsExperience,
} from '@/lib/utils/talentPoolHelpers';

// --- TYPES ---
interface ExtendedProfile extends AnonymizedTalentProfile {
  skills?: string[];
  availability?: string;
}

// --- MAPPINGS (For Display) ---
const SENIORITY_MAP: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  executive: 'Executive'
};

const CANTON_NAMES: Record<string, string> = {
  'ZH': 'Zürich',
  'GE': 'Geneva',
  'BS': 'Basel',
  'BL': 'Basel', // Grouping BS/BL as Basel for cleaner UI usually, or keep distinct
  'VD': 'Vaud',
  'BE': 'Bern',
  'ZG': 'Zug',
  'LU': 'Lucerne',
  'AG': 'Aargau',
  'SG': 'St. Gallen',
  'TI': 'Ticino',
  'VS': 'Valais'
};

// Filter Options for Sidebar (Codes + Display Names)
const CANTON_FILTERS = [
  { code: 'ZH', name: 'Zürich' },
  { code: 'GE', name: 'Geneva' },
  { code: 'BS', name: 'Basel' },
  { code: 'VD', name: 'Vaud' },
  { code: 'ZG', name: 'Zug' },
  { code: 'BE', name: 'Bern' },
  { code: 'LU', name: 'Lucerne' },
];

const SENIORITY_FILTERS = [
  { label: 'Junior (0-2 years)', value: 'junior' },
  { label: 'Mid-level (3-6 years)', value: 'mid' },
  { label: 'Senior (7+ years)', value: 'senior' },
];

export default function TalentPoolContent() {
  // --- STATE ---
  const [candidates, setCandidates] = useState<ExtendedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCantons, setSelectedCantons] = useState<string[]>([]);
  const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
  const [salaryMax, setSalaryMax] = useState<number>(250000);
  const [sortBy, setSortBy] = useState<string>('created_at');

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Map filters
        if (selectedSeniority.length > 0) {
          params.set('seniority', selectedSeniority[selectedSeniority.length - 1]);
        }
        if (selectedCantons.length > 0) {
          params.set('cantons', selectedCantons.join(','));
        }

        params.set('salary_max', salaryMax.toString());
        params.set('sort_by', sortBy);
        params.set('limit', '100');

        const res = await fetch(`/api/talent-pool/list?${params.toString()}`);
        const data: TalentPoolListResponse = await res.json();

        if (data.success) {
          setCandidates(data.data.candidates as unknown as ExtendedProfile[]);
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCandidates, 300);
    return () => clearTimeout(timer);
  }, [selectedCantons, selectedSeniority, salaryMax, sortBy]);

  // --- SEARCH FILTERING ---
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;
    const lowerTerm = searchTerm.toLowerCase();

    return candidates.filter(c => {
      const idMatch = c.talent_id.toLowerCase().includes(lowerTerm);
      const skillMatch = c.skills?.some(s => s.toLowerCase().includes(lowerTerm));
      return idMatch || skillMatch;
    });
  }, [candidates, searchTerm]);

  // --- HELPERS ---
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

  const formatCurrency = (val: number | null) => {
    if (!val) return 'Neg.';
    return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumSignificantDigits: 3 }).format(val);
  };

  // Format Canton List for Card (Code -> Full Name)
  const formatCantonList = (codes: string[]) => {
    if (!codes || codes.length === 0) return 'Switzerland';
    return codes
      .slice(0, 3) // Limit to 3
      .map(code => CANTON_NAMES[code] || code) // Map to name or keep code if missing
      .join(', ');
  };

  const getCandidateTitle = (c: ExtendedProfile) => {
    // Use mapped seniority (e.g. "Senior")
    const level = SENIORITY_MAP[c.seniority_level] || 'Mid-level';
    const skill = c.skills && c.skills[0] ? c.skills[0] : 'Software';
    return `${level} ${skill} Engineer`;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = '/'}>
              <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg font-serif">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Silvia&apos;s<span className="font-light text-slate-500">List</span></span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">For Companies</a>
              <Link href="/join" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">For Talent</Link>
              <div className="h-4 w-px bg-slate-200"></div>
              <Link href="/join">
                <Button variant="primary" icon={ArrowRight}>Join the List</Button>
              </Link>
            </div>

            <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 shadow-lg">
            <a href="#" className="block text-sm font-medium text-slate-600 hover:text-slate-900">For Companies</a>
            <Link href="/join" className="block text-sm font-medium text-slate-600 hover:text-slate-900">For Talent</Link>
            <Link href="/join" className="block w-full"><Button className="w-full">Join the List</Button></Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <Badge style="outline">Switzerland&apos;s #1 Tech Talent Pool</Badge>
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

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* SIDEBAR */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search by skill, role, or ID..."
                className="w-full pl-10 pr-4 py-2.5 !bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all group-hover:border-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Seniority
              </h3>
              <div className="space-y-2.5">
                {SENIORITY_FILTERS.map((level) => (
                  <label key={level.value} className="flex items-center gap-3 group cursor-pointer select-none">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="checkbox-slate"
                        checked={selectedSeniority.includes(level.value)}
                        onChange={() => toggleSeniority(level.value)}
                      />
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Preferred Location
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Using CANTON_FILTERS to show names like "Zürich" instead of "ZH" */}
                {CANTON_FILTERS.map((canton) => (
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
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Salary (CHF)
              </h3>
              <div className="px-1">
                <input
                  type="range"
                  min="80000"
                  max="300000"
                  step="10000"
                  value={salaryMax}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  onChange={(e) => setSalaryMax(parseInt(e.target.value))}
                />
                <div className="flex justify-between mt-3 text-xs text-slate-500 font-medium font-mono">
                  <span>80K</span>
                  <span>{salaryMax / 1000}K</span>
                </div>
              </div>
            </div>

            {(selectedCantons.length > 0 || selectedSeniority.length > 0 || searchTerm) && (
              <button
                onClick={() => { setSelectedCantons([]); setSelectedSeniority([]); setSearchTerm(''); setSalaryMax(250000); }}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors border-b border-transparent hover:border-slate-900 pb-0.5 w-max"
              >
                <X className="w-3 h-3" /> Clear all filters
              </button>
            )}
          </aside>

          {/* RESULTS */}
          <main className="flex-1">
            <div className="flex justify-between items-end mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                Candidates <span className="text-slate-400 font-light ml-2 text-lg">{filteredCandidates.length} results</span>
              </h2>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Sort by:</span>
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent pr-6 pl-0 font-medium text-slate-900 focus:outline-none cursor-pointer hover:text-slate-700"
                  >
                    <option value="created_at">Newest</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
              </div>
            ) : filteredCandidates.length === 0 ? (
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
                    key={candidate.talent_id}
                    className="group bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-400 hover:shadow-md transition-all duration-300 relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                            {candidate.talent_id}
                          </span>
                          {/* Mapped Seniority (e.g. "Senior" instead of "senior") */}
                          <Badge style={candidate.seniority_level === 'senior' ? 'dark' : 'default'}>
                            {SENIORITY_MAP[candidate.seniority_level] || candidate.seniority_level}
                          </Badge>
                          <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                            <Clock className="w-3 h-3" /> Added {formatEntryDate(candidate.entry_date)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:underline decoration-slate-300 underline-offset-4 decoration-2 transition-all">
                          {getCandidateTitle(candidate)}
                        </h3>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 mt-4 mb-5">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            {formatYearsExperience(candidate.years_of_experience)} Exp.
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {/* Mapped Canton Names */}
                            {formatCantonList(candidate.preferred_cantons)}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="font-mono text-slate-700">
                              {formatCurrency(candidate.salary_range.min)} – {formatCurrency(candidate.salary_range.max)}
                            </span>
                          </div>
                        </div>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills && candidate.skills.length > 0 ? (
                            candidate.skills.map(skill => (
                              <span key={skill} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded hover:border-slate-400 hover:text-slate-900 transition-colors cursor-default">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Generalist</span>
                          )}
                        </div>
                      </div>

                      {/* Availability & Action */}
                      <div className="flex flex-col sm:items-end gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 min-w-[140px]">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">Availability</p>
                          <p className="text-sm font-medium text-slate-900">{candidate.availability || 'Negotiable'}</p>
                        </div>

                        <Button
                          variant="secondary"
                          className="w-full sm:w-auto text-xs sm:text-sm"
                          onClick={() => setShowContactModal(candidate.talent_id)}
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

      {/* FOOTER & MODAL (Unchanged) */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm font-serif">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm leading-none">Silvia&apos;s List</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Tech Recruitment Switzerland</span>
              </div>
            </div>
            <div className="text-sm text-slate-500 flex gap-8">
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
              <a href="mailto:contact@silviaslist.com" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              © {new Date().getFullYear()} Silvia&apos;s List.
            </div>
          </div>
        </div>
      </footer>

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
                navigator.clipboard.writeText('silvia@silviaslist.com');
                alert(`Email copied! Reference ID: ${showContactModal}`);
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