'use client';

import React from 'react';
import { AnonymizedTalentProfile } from '@/types/talentPool';
import {
  formatSalary,
  formatEntryDate,
  formatYearsExperience,
  formatCantons,
  getSeniorityLabel,
} from '@/lib/utils/talentPoolHelpers';

interface TalentTableProps {
  candidates: AnonymizedTalentProfile[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  loading?: boolean;
}

export default function TalentTable({
  candidates,
  sortBy,
  sortOrder,
  onSort,
  loading = false,
}: TalentTableProps) {
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4" fill="none" stroke="var(--accent-gold)" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="var(--accent-gold)" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const handleRowClick = (candidate: AnonymizedTalentProfile) => {
    // Show tooltip about contacting Silvia
    alert(`Interested in ${candidate.talent_id}?\n\nEmail silvia@silviaslist.com with the Talent ID to request an introduction.`);
  };

  // Loading state is now handled inside the table structure

  if (!loading && candidates.length === 0) {
    return (
      <div className="rounded-lg p-12 shadow-lg text-center" style={{
        backgroundColor: 'var(--surface-1)',
        borderColor: 'var(--light-400)',
        borderWidth: '1px'
      }}>
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          No candidates found
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg overflow-hidden" style={{
      backgroundColor: 'var(--surface-1)',
      borderColor: 'var(--light-400)',
      borderWidth: '1px'
    }}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '2px solid var(--accent-gold)' }}>
              <th className="px-6 py-4 text-left w-[15%]">
                <button
                  onClick={() => onSort('talent_id')}
                  className="flex items-center gap-2 font-semibold text-sm transition-colors"
                  style={{ color: sortBy === 'talent_id' ? 'var(--accent-gold)' : 'var(--text-secondary)' }}
                >
                  Talent ID
                  {getSortIcon('talent_id')}
                </button>
              </th>
              <th className="px-6 py-4 text-left w-[15%]">
                <button
                  onClick={() => onSort('created_at')}
                  className="flex items-center gap-2 font-semibold text-sm transition-colors"
                  style={{ color: sortBy === 'created_at' ? 'var(--accent-gold)' : 'var(--text-secondary)' }}
                >
                  Entry Date
                  {getSortIcon('created_at')}
                </button>
              </th>
              <th className="px-6 py-4 text-left w-[20%]">
                <button
                  onClick={() => onSort('years_of_experience')}
                  className="flex items-center gap-2 font-semibold text-sm transition-colors"
                  style={{ color: sortBy === 'years_of_experience' ? 'var(--accent-gold)' : 'var(--text-secondary)' }}
                >
                  Experience
                  {getSortIcon('years_of_experience')}
                </button>
              </th>
              <th className="px-6 py-4 text-left w-[30%]">
                <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Preferred Cantons
                </span>
              </th>
              <th className="px-6 py-4 text-left w-[20%]">
                <button
                  onClick={() => onSort('salary_max')}
                  className="flex items-center gap-2 font-semibold text-sm transition-colors"
                  style={{ color: sortBy === 'salary_max' ? 'var(--accent-gold)' : 'var(--text-secondary)' }}
                >
                  Expected Salary
                  {getSortIcon('salary_max')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton Rows
              Array.from({ length: 5 }).map((_, index) => (
                <tr
                  key={`skeleton-${index}`}
                  style={{
                    borderBottom: index < 4 ? '1px solid var(--light-400)' : 'none'
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="h-5 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--surface-2)' }} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--surface-2)' }} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="h-5 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--surface-2)' }} />
                      <div className="h-5 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--surface-2)' }} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--surface-2)' }} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--surface-2)' }} />
                  </td>
                </tr>
              ))
            ) : (
              candidates.map((candidate, index) => (
                <tr
                  key={candidate.talent_id}
                  onClick={() => handleRowClick(candidate)}
                  className="cursor-pointer transition-all"
                  style={{
                    borderBottom: index < candidates.length - 1 ? '1px solid var(--light-400)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                    e.currentTarget.style.transform = 'scale(1.005)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <td className="px-6 py-4">
                    <span className="font-bold text-sm" style={{ color: 'var(--accent-gold)' }}>
                      {candidate.talent_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {formatEntryDate(candidate.entry_date)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {formatYearsExperience(candidate.years_of_experience)}
                      </span>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium w-fit"
                        style={{
                          backgroundColor: 'var(--accent-gold-alpha)',
                          color: 'var(--accent-gold)',
                          borderColor: 'var(--accent-gold-border)',
                          borderWidth: '1px'
                        }}
                      >
                        {getSeniorityLabel(candidate.seniority_level)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatCantons(candidate.preferred_cantons, 3)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatSalary(candidate.salary_range.min, candidate.salary_range.max)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {candidates.map((candidate) => (
          <div
            key={candidate.talent_id}
            onClick={() => handleRowClick(candidate)}
            className="rounded-lg p-4 cursor-pointer transition-all"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--light-400)',
              borderWidth: '1px'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="font-bold" style={{ color: 'var(--accent-gold)' }}>
                {candidate.talent_id}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: 'var(--accent-gold-alpha)',
                  color: 'var(--accent-gold)',
                  borderColor: 'var(--accent-gold-border)',
                  borderWidth: '1px'
                }}
              >
                {getSeniorityLabel(candidate.seniority_level)}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div style={{ color: 'var(--text-primary)' }}>
                <span className="font-medium">{formatYearsExperience(candidate.years_of_experience)}</span>
                {' '}experience
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {formatCantons(candidate.preferred_cantons, 5)}
              </div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {formatSalary(candidate.salary_range.min, candidate.salary_range.max)}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Joined {formatEntryDate(candidate.entry_date)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
