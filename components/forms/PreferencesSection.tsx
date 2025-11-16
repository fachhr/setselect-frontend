'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { TalentPoolFormData } from '@/lib/validation/talentPoolSchema';
import { DualRangeSlider } from '../ui/DualRangeSlider';
import {
  DURATION_OPTIONS,
  LOCATION_OPTIONS
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

  const workingCapacity = watch('working_capacity_percent') || 50;
  const salaryMin = watch('salary_min') || 0;
  const salaryMax = watch('salary_max') || 50000;
  const salaryConfidential = watch('salary_confidential') || false;
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

      {/* Working Capacity */}
      <div>
        <label htmlFor="working_capacity_percent" className="label-base">
          Working Capacity <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>10%</span>
            <span className="font-semibold text-lg text-primary">{workingCapacity}%</span>
            <span>100%</span>
          </div>
          <input
            type="range"
            id="working_capacity_percent"
            min="10"
            max="100"
            step="5"
            {...register('working_capacity_percent', { valueAsNumber: true })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        {errors.working_capacity_percent && (
          <p className="error-message">{errors.working_capacity_percent.message}</p>
        )}
      </div>

      {/* Available From */}
      <div>
        <label htmlFor="available_from_date" className="label-base">
          Available From <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="available_from_date"
          {...register('available_from_date')}
          min={new Date().toISOString().split('T')[0]}
          className={`input-base ${errors.available_from_date ? 'input-error' : ''}`}
        />
        {errors.available_from_date && (
          <p className="error-message">{errors.available_from_date.message}</p>
        )}
      </div>

      {/* Desired Duration */}
      <div>
        <label htmlFor="desired_duration_months" className="label-base">
          Desired Contract Duration <span className="text-red-500">*</span>
        </label>
        <select
          id="desired_duration_months"
          {...register('desired_duration_months')}
          className={`input-base ${errors.desired_duration_months ? 'input-error' : ''}`}
        >
          <option value="">Select duration</option>
          {DURATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.desired_duration_months && (
          <p className="error-message">{errors.desired_duration_months.message}</p>
        )}
      </div>

      {/* Desired Locations */}
      <div>
        <label className="label-base">
          Desired Locations <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">Select up to 5 Swiss cantons</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
          {LOCATION_OPTIONS.map((location) => (
            <label
              key={location.value}
              className={`
                flex items-center p-2 rounded cursor-pointer transition-colors
                ${selectedLocations.includes(location.value) ? 'bg-primary/10 border border-primary' : 'hover:bg-gray-50'}
                ${!selectedLocations.includes(location.value) && selectedLocations.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={selectedLocations.includes(location.value)}
                onChange={() => toggleLocation(location.value)}
                disabled={!selectedLocations.includes(location.value) && selectedLocations.length >= 5}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{location.label}</span>
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
          <p className="text-xs text-gray-500 mt-2">
            {selectedLocations.length} of 5 selected: {selectedLocations.join(', ')}
          </p>
        )}
      </div>

      {/* Salary Expectation */}
      <div>
        <label className="label-base">
          Salary Expectation (CHF/month)
        </label>

        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('salary_confidential')}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
            />
            <span className="text-sm text-gray-700">Prefer not to disclose</span>
          </label>

          {!salaryConfidential && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Desired monthly salary range (in thousands CHF)</span>
                <span className="font-bold text-lg text-[var(--foreground)] bg-[var(--light-800)] px-3 py-1 rounded-md">
                  {Math.round(salaryMin / 1000)}k - {Math.round(salaryMax / 1000)}k CHF
                </span>
              </div>

              <DualRangeSlider
                min={0}
                max={50}
                step={0.5}
                valueMin={salaryMin / 1000}
                valueMax={salaryMax / 1000}
                onChange={(min, max) => {
                  setValue('salary_min', min * 1000, { shouldValidate: true });
                  setValue('salary_max', max * 1000, { shouldValidate: true });
                }}
              />
            </div>
          )}
        </div>

        {errors.salary_min && (
          <p className="error-message">{errors.salary_min.message}</p>
        )}
        {errors.salary_max && (
          <p className="error-message">{errors.salary_max.message}</p>
        )}
      </div>
    </div>
  );
}
