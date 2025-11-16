'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { TalentPoolFormData } from '@/lib/validation/talentPoolSchema';
import { ErrorSummary } from '../ui/ErrorSummary';
import Link from 'next/link';

interface TermsSectionProps {
  register: UseFormRegister<TalentPoolFormData>;
  errors: FieldErrors<TalentPoolFormData>;
  allErrors: FieldErrors<TalentPoolFormData>; // All form errors for summary
  isSubmitting: boolean;
}

export function TermsSection({
  register,
  errors,
  allErrors,
  isSubmitting
}: TermsSectionProps) {
  const hasErrors = Object.keys(allErrors).length > 0;
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Terms & Submit</h2>
        <p className="text-[var(--dark-600)]">
          Review and accept our terms to complete your application.
        </p>
      </div>

      {/* Terms & Conditions */}
      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('accepted_terms')}
            className={`
              h-5 w-5 flex-shrink-0 text-primary border-[var(--light-400)] rounded focus:ring-primary accent-primary
              ${errors.accepted_terms ? 'border-red-500' : ''}
            `}
          />
          <span className="text-sm text-[var(--dark-800)]">
            I accept the{' '}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark underline font-medium"
            >
              Terms and Conditions
            </Link>
            {' '}and confirm that the information provided is accurate.
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
        {errors.accepted_terms && (
          <p className="error-message ml-8">{errors.accepted_terms.message}</p>
        )}
      </div>

      {/* Error Summary - appears right before submit when there are errors */}
      {hasErrors && <ErrorSummary errors={allErrors} />}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200
          ${isSubmitting
            ? 'bg-[var(--light-600)] text-[var(--dark-400)] cursor-not-allowed shadow-none'
            : 'bg-[var(--primary)] text-[var(--button-text-on-primary)] shadow-lg hover:shadow-xl transform hover:scale-[1.03] active:scale-[0.97] hover:bg-[var(--primary-dark)] border-2 border-[var(--dark-800)]'
          }
        `}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          'Join Talent Pool →'
        )}
      </button>

      {/* Helper Text */}
      <p className="text-xs text-center text-[var(--dark-400)]">
        By submitting this form, you'll be added to Silvia's List talent pool.
        We'll review your profile and contact you when we have matching opportunities.
      </p>
    </div>
  );
}
