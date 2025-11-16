'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { TalentPoolFormData } from '@/lib/validation/talentPoolSchema';
import {
  LOCATION_OPTIONS,
  NOTICE_PERIOD_OPTIONS
} from '@/lib/formOptions';

interface PreferencesSectionProps {
  register: UseFormRegister<TalentPoolFormData>;
  errors: FieldErrors<TalentPoolFormData>;
  watch: UseFormWatch<TalentPoolFormData>;
  setValue: UseFormSetValue<TalentPoolFormData>;
}

export function PreferencesSection({
  register,
  errors,
  watch,
  setValue
}: PreferencesSectionProps) {
  const [showOtherLocation, setShowOtherLocation] = useState(false);

  const salaryMin = watch('salary_min') || 0;
  const salaryMax = watch('salary_max') || 0;
  const selectedLocations = watch('desired_locations') || [];

  const toggleLocation = (location: string) => {
    if (location === 'Other') {
      setShowOtherLocation(!showOtherLocation);
      return;
    }

    const current = selectedLocations;
    if (current.includes(location)) {
      setValue('desired_locations', current.filter(l => l !== location), { shouldValidate: true });
    } else if (current.length < 5) {
      setValue('desired_locations', [...current, location], { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Job Preferences</h2>
        <p className="text-[var(--dark-600)]">
          Help us find the perfect match by sharing your preferences and expectations.
        </p>
      </div>

      {/* Notice Period */}
      <div>
        <label htmlFor="notice_period_months" className="label-base">
          Notice Period <span className="text-[var(--error-color)]">*</span>
        </label>
        <select
          id="notice_period_months"
          {...register('notice_period_months')}
          className={`input-base ${errors.notice_period_months ? 'input-error' : ''}`}
        >
          {NOTICE_PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.notice_period_months && (
          <p className="error-message">{errors.notice_period_months.message}</p>
        )}
      </div>

      {/* Desired Locations */}
      <div>
        <label className="label-base">
          Desired Locations <span className="text-[var(--error-color)]">*</span>
        </label>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Select up to 5 Swiss cantons</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
          {LOCATION_OPTIONS.map((location) => (
            <label
              key={location.value}
              className={`
                flex items-center p-2 rounded cursor-pointer transition-colors
                ${selectedLocations.includes(location.value) ? 'bg-[var(--primary-alpha)] border border-[var(--primary)]' : 'hover:bg-[var(--light-800)]'}
                ${!selectedLocations.includes(location.value) && selectedLocations.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={selectedLocations.includes(location.value)}
                onChange={() => toggleLocation(location.value)}
                disabled={!selectedLocations.includes(location.value) && selectedLocations.length >= 5}
                className="h-4 w-4 text-[var(--primary)] border-[var(--light-400)] rounded focus:ring-[var(--primary)] accent-[var(--primary)]"
              />
              <span className="ml-2 text-sm text-[var(--text-secondary)]">{location.label}</span>
            </label>
          ))}
        </div>
        {showOtherLocation && (
          <div className="mt-3">
            <input
              type="text"
              {...register('desired_other_location')}
              placeholder="Specify other location"
              className="input-base"
            />
          </div>
        )}
        {errors.desired_locations && (
          <p className="error-message">{errors.desired_locations.message}</p>
        )}
        {selectedLocations.length > 0 && (
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            {selectedLocations.length} of 5 selected: {selectedLocations.join(', ')}
          </p>
        )}
      </div>

      {/* Salary Expectation */}
      <div>
        <label className="label-base">
          Yearly Salary Expectation (including bonus) <span className="text-[var(--error-color)]">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {/* Minimum Salary */}
          <div>
            <label htmlFor="salary_min" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Minimum (CHF)
            </label>
            <input
              type="number"
              id="salary_min"
              min="0"
              step="1000"
              {...register('salary_min', { valueAsNumber: true })}
              placeholder="e.g., 150000"
              className={`input-base ${errors.salary_min ? 'input-error' : ''}`}
            />
            {errors.salary_min && (
              <p className="error-message">{errors.salary_min.message}</p>
            )}
          </div>

          {/* Maximum Salary */}
          <div>
            <label htmlFor="salary_max" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Maximum (CHF)
            </label>
            <input
              type="number"
              id="salary_max"
              min="0"
              step="10000"
              {...register('salary_max', { valueAsNumber: true })}
              placeholder="e.g., 200000"
              className={`input-base ${errors.salary_max ? 'input-error' : ''}`}
            />
            {errors.salary_max && (
              <p className="error-message">{errors.salary_max.message}</p>
            )}
          </div>
        </div>

        {/* Display Range */}
        {salaryMin > 0 && salaryMax > 0 && (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Your desired salary range is <span className="font-semibold text-[var(--text-primary)]">
              {salaryMin.toLocaleString()} - {salaryMax.toLocaleString()} CHF
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
