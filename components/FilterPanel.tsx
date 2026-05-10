'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Bookmark, Check, ChevronDown, Trash2 } from 'lucide-react';
import type { Market } from '@/types/recruiter';
import { getMarketConfig } from '@/lib/markets';

export interface AdvancedFilters {
  skills: string[];
  languages: string[];
  salaryMin: string;
  salaryMax: string;
  noticePeriod: string[];
  workEligibility: string[];
}

export const EMPTY_ADVANCED_FILTERS: AdvancedFilters = {
  skills: [],
  languages: [],
  salaryMin: '',
  salaryMax: '',
  noticePeriod: [],
  workEligibility: [],
};

export function countActiveFilters(f: AdvancedFilters): number {
  let count = 0;
  if (f.skills.length > 0) count++;
  if (f.languages.length > 0) count++;
  if (f.salaryMin || f.salaryMax) count++;
  if (f.noticePeriod.length > 0) count++;
  if (f.workEligibility.length > 0) count++;
  return count;
}

const NOTICE_OPTIONS = [
  { value: '0', label: 'Immediate' },
  { value: '1', label: '1 month' },
  { value: '2', label: '2 months' },
  { value: '3', label: '3 months' },
  { value: '3+', label: '3+ months' },
];

interface SavedSearch {
  id: string;
  name: string;
  filters: AdvancedFilters;
  search: string;
}

interface FilterPanelProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  skillOptions: { value: string; label: string }[];
  languageOptions: { value: string; label: string }[];
  market: Market;
  search: string;
  onApplySavedSearch: (search: string, filters: AdvancedFilters) => void;
}

function FilterMultiSelect({
  options,
  selected,
  onChange,
  label,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const updatePos = useCallback(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: Math.max(rect.width, 200),
        maxWidth: 280,
        zIndex: 60,
      });
    }
  }, [open]);

  useEffect(() => { updatePos(); }, [updatePos]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const hasSelection = selected.length > 0;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-1.5 w-full px-2.5 py-1.5 rounded-md text-[11px] border transition-colors cursor-pointer ${
          hasSelection
            ? 'border-[var(--secondary)] bg-[var(--secondary-dim)] text-[var(--text-primary)]'
            : 'border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--text-tertiary)]'
        }`}
      >
        <span className="truncate">
          {hasSelection ? `${selected.length} selected` : label}
        </span>
        {hasSelection ? (
          <X
            size={11}
            className="flex-shrink-0 hover:text-[var(--error)]"
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
          />
        ) : (
          <ChevronDown size={11} className="flex-shrink-0" />
        )}
      </button>
      {open && (
        <div
          ref={dropdownRef}
          style={style}
          className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg shadow-lg max-h-56 overflow-y-auto"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[11px] text-[var(--text-muted)]">No options</div>
          ) : (
            options.map(opt => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-left hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer ${
                    isSelected ? 'text-[var(--secondary)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-[var(--secondary)] bg-[var(--secondary)]' : 'border-[var(--border-strong)]'
                  }`}>
                    {isSelected && <Check size={9} className="text-[var(--bg-root)]" />}
                  </span>
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </>
  );
}

function SavedSearchesDropdown({
  searches,
  onApply,
  onDelete,
  onSave,
}: {
  searches: SavedSearch[];
  onApply: (s: SavedSearch) => void;
  onDelete: (id: string) => void;
  onSave: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md cursor-pointer border transition-colors ${
          open
            ? 'border-[var(--secondary)] bg-[var(--secondary-dim)] text-[var(--text-primary)]'
            : 'border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        }`}
      >
        <Bookmark size={11} />
        <span className="hidden sm:inline">Saved</span>
        {searches.length > 0 && (
          <span className="text-[9px] bg-[var(--bg-surface-1)] px-1 rounded-full">{searches.length}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface-1)] shadow-lg">
          <div className="p-2 border-b border-[var(--border-subtle)]">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && saveName.trim()) {
                    onSave(saveName.trim());
                    setSaveName('');
                  }
                }}
                placeholder="Save current filters as..."
                className="input-base flex-1 px-2 py-1 rounded text-[11px]"
              />
              <button
                type="button"
                disabled={!saveName.trim()}
                onClick={() => { onSave(saveName.trim()); setSaveName(''); }}
                className="text-[10px] px-2 py-1 rounded border border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] cursor-pointer disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>

          {searches.length === 0 ? (
            <div className="px-3 py-3 text-[11px] text-[var(--text-muted)] text-center">
              No saved searches yet
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {searches.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-[var(--bg-surface-2)] transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => { onApply(s); setOpen(false); }}
                    className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer truncate flex-1 text-left"
                  >
                    {s.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(s.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--error)] cursor-pointer transition-opacity"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SAVED_SEARCHES_KEY = 'talentPool_savedSearches';

function loadSavedSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function persistSavedSearches(searches: SavedSearch[]) {
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
}

export function FilterPanel({
  filters,
  onChange,
  skillOptions,
  languageOptions,
  market,
  search,
  onApplySavedSearch,
}: FilterPanelProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(loadSavedSearches);
  const marketConfig = getMarketConfig(market);
  const eligibilityOptions = marketConfig.workEligibility;
  const currency = marketConfig.currency.symbol;

  const update = (patch: Partial<AdvancedFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const clearAll = () => onChange({ ...EMPTY_ADVANCED_FILTERS });

  const activeCount = countActiveFilters(filters);

  const handleSave = (name: string) => {
    const entry: SavedSearch = {
      id: crypto.randomUUID(),
      name,
      filters: { ...filters },
      search,
    };
    const next = [entry, ...savedSearches];
    setSavedSearches(next);
    persistSavedSearches(next);
  };

  const handleDeleteSaved = (id: string) => {
    const next = savedSearches.filter(s => s.id !== id);
    setSavedSearches(next);
    persistSavedSearches(next);
  };

  const handleApplySaved = (s: SavedSearch) => {
    onApplySavedSearch(s.search, s.filters);
  };

  return (
    <div className="glass-panel rounded-lg px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        {/* Skills */}
        <div className="w-[160px]">
          <label className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)] block mb-1">Skills</label>
          <FilterMultiSelect
            options={skillOptions}
            selected={filters.skills}
            onChange={(v) => update({ skills: v })}
            label="Any skill"
          />
        </div>

        {/* Languages */}
        <div className="w-[160px]">
          <label className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)] block mb-1">Languages</label>
          <FilterMultiSelect
            options={languageOptions}
            selected={filters.languages}
            onChange={(v) => update({ languages: v })}
            label="Any language"
          />
        </div>

        {/* Salary range */}
        <div className="w-[200px]">
          <label className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)] block mb-1">
            Salary ({currency})
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              inputMode="numeric"
              value={filters.salaryMin}
              onChange={(e) => update({ salaryMin: e.target.value.replace(/[^\d]/g, '') })}
              placeholder="Min"
              className="input-base w-full px-2 py-1.5 rounded-md text-[11px]"
            />
            <span className="text-[var(--text-muted)] text-[11px]">–</span>
            <input
              type="text"
              inputMode="numeric"
              value={filters.salaryMax}
              onChange={(e) => update({ salaryMax: e.target.value.replace(/[^\d]/g, '') })}
              placeholder="Max"
              className="input-base w-full px-2 py-1.5 rounded-md text-[11px]"
            />
          </div>
        </div>

        {/* Notice period */}
        <div className="w-[140px]">
          <label className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)] block mb-1">Notice</label>
          <FilterMultiSelect
            options={NOTICE_OPTIONS}
            selected={filters.noticePeriod}
            onChange={(v) => update({ noticePeriod: v })}
            label="Any"
          />
        </div>

        {/* Work eligibility */}
        <div className="w-[160px]">
          <label className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)] block mb-1">Eligibility</label>
          <FilterMultiSelect
            options={eligibilityOptions}
            selected={filters.workEligibility}
            onChange={(v) => update({ workEligibility: v })}
            label="Any"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <SavedSearchesDropdown
            searches={savedSearches}
            onApply={handleApplySaved}
            onDelete={handleDeleteSaved}
            onSave={handleSave}
          />
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--error)] cursor-pointer rounded-md border border-[var(--border-subtle)] hover:border-[var(--error)] transition-colors"
            >
              <X size={11} />
              Clear {activeCount}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
