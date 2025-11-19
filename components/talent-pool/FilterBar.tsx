'use client';

import React, { useState } from 'react';
import { SeniorityLevel } from '@/types/talentPool';
import { LOCATION_OPTIONS } from '@/lib/formOptions';
import { SALARY_MIN, SALARY_MAX, SALARY_STEP } from '@/lib/constants';

export interface FilterState {
  seniority: SeniorityLevel | 'all';
  cantons: string[];
  salaryMin: number;
  salaryMax: number;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const SENIORITY_OPTIONS: Array<{ value: SeniorityLevel | 'all'; label: string }> = [
  { value: 'all', label: 'All Levels' },
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-level (3-6 years)' },
  { value: 'senior', label: 'Senior (7+ years)' },
];

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [showCantonDropdown, setShowCantonDropdown] = useState(false);

  // Handle seniority change
  const handleSeniorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      seniority: e.target.value as SeniorityLevel | 'all',
    });
  };

  // Handle canton toggle
  const handleCantonToggle = (cantonValue: string) => {
    const newCantons = filters.cantons.includes(cantonValue)
      ? filters.cantons.filter(c => c !== cantonValue)
      : [...filters.cantons, cantonValue];

    onFilterChange({
      ...filters,
      cantons: newCantons,
    });
  };

  // Handle salary range change
  const handleSalaryMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    if (valStr === '') {
      onFilterChange({
        ...filters,
        salaryMin: NaN,
      });
      return;
    }

    const value = parseInt(valStr, 10);
    onFilterChange({
      ...filters,
      salaryMin: value,
      // Only enforce max >= min if max is set (not NaN)
      salaryMax: !isNaN(filters.salaryMax) ? Math.max(value, filters.salaryMax) : filters.salaryMax,
    });
  };

  const handleSalaryMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    if (valStr === '') {
      onFilterChange({
        ...filters,
        salaryMax: NaN,
      });
      return;
    }

    const value = parseInt(valStr, 10);
    onFilterChange({
      ...filters,
      salaryMax: value,
      // Only enforce min <= max if min is set (not NaN)
      salaryMin: !isNaN(filters.salaryMin) ? Math.min(value, filters.salaryMin) : filters.salaryMin,
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    onFilterChange({
      seniority: 'all',
      cantons: [],
      salaryMin: SALARY_MIN,
      salaryMax: SALARY_MAX,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.seniority !== 'all' ||
    filters.cantons.length > 0 ||
    (filters.salaryMin !== SALARY_MIN && !isNaN(filters.salaryMin)) ||
    (filters.salaryMax !== SALARY_MAX && !isNaN(filters.salaryMax));

  // Filter out "Other" from canton options
  const cantonOptions = LOCATION_OPTIONS.filter(opt => opt.value !== 'Other');

  return (
    <div className="rounded-lg p-6 shadow-lg" style={{
      backgroundColor: 'var(--surface-1)',
      borderColor: 'var(--light-400)',
      borderWidth: '1px'
    }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Seniority Filter */}
        <div>
          <label className="label-base" htmlFor="seniority-filter">
            Seniority Level
          </label>
          <select
            id="seniority-filter"
            className="input-base w-full"
            value={filters.seniority}
            onChange={handleSeniorityChange}
          >
            {SENIORITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Canton Filter */}
        <div className="relative">
          <label className="label-base">
            Preferred Cantons
            {filters.cantons.length > 0 && (
              <span className="ml-2 text-xs" style={{ color: 'var(--accent-gold)' }}>
                ({filters.cantons.length} selected)
              </span>
            )}
          </label>
          <button
            type="button"
            className="input-base w-full text-left flex items-center justify-between"
            onClick={() => setShowCantonDropdown(!showCantonDropdown)}
          >
            <span style={{ color: filters.cantons.length > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
              {filters.cantons.length > 0
                ? `${filters.cantons.slice(0, 2).join(', ')}${filters.cantons.length > 2 ? ` +${filters.cantons.length - 2}` : ''}`
                : 'Select cantons...'}
            </span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Canton Dropdown */}
          {showCantonDropdown && (
            <div
              className="absolute z-10 mt-2 w-full rounded-lg shadow-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--surface-3)',
                borderColor: 'var(--accent-gold-border)',
                borderWidth: '1px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}
            >
              <div className="p-2">
                {cantonOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center px-3 py-2 rounded cursor-pointer transition-colors"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={filters.cantons.includes(option.value)}
                      onChange={() => handleCantonToggle(option.value)}
                      className="mr-3"
                      style={{
                        accentColor: 'var(--accent-gold)',
                      }}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Salary Range Filter */}
        <div>
          <label className="label-base">
            Salary Range (CHF)
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  id="salary-min"
                  className="input-base w-full text-sm"
                  value={isNaN(filters.salaryMin) ? '' : filters.salaryMin}
                  onChange={handleSalaryMinChange}
                  min={SALARY_MIN}
                  max={SALARY_MAX}
                  step={SALARY_STEP}
                  placeholder="Min"
                  aria-label="Minimum Salary"
                />
              </div>
              <span style={{ color: 'var(--text-tertiary)' }}>-</span>
              <div className="flex-1">
                <input
                  type="number"
                  id="salary-max"
                  className="input-base w-full text-sm"
                  value={isNaN(filters.salaryMax) ? '' : filters.salaryMax}
                  onChange={handleSalaryMaxChange}
                  min={SALARY_MIN}
                  max={SALARY_MAX}
                  step={SALARY_STEP}
                  placeholder="Max"
                  aria-label="Maximum Salary"
                />
              </div>
            </div>
            <div className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              {((filters.salaryMin || 0) / 1000).toFixed(0)}K - {((filters.salaryMax || 0) / 1000).toFixed(0)}K CHF
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters & Clear Button */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--light-400)' }}>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm transition-colors"
            style={{
              color: 'var(--accent-gold)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-gold)'}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
