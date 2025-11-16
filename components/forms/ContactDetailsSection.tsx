'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { TalentPoolFormData } from '@/lib/validation/talentPoolSchema';
import { PHONE_COUNTRY_CODE_OPTIONS } from '@/lib/formOptions';

interface ContactDetailsSectionProps {
  register: UseFormRegister<TalentPoolFormData>;
  errors: FieldErrors<TalentPoolFormData>;
}

export function ContactDetailsSection({
  register,
  errors
}: ContactDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Personal Details</h2>
        <p className="text-[var(--dark-600)]">
          Tell us about yourself. We'll use this information to match you with the best opportunities.
        </p>
      </div>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact_first_name" className="label-base">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contact_first_name"
            {...register('contact_first_name')}
            className={`input-base ${errors.contact_first_name ? 'input-error' : ''}`}
            placeholder="John"
          />
          {errors.contact_first_name && (
            <p className="error-message">{errors.contact_first_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contact_last_name" className="label-base">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contact_last_name"
            {...register('contact_last_name')}
            className={`input-base ${errors.contact_last_name ? 'input-error' : ''}`}
            placeholder="Doe"
          />
          {errors.contact_last_name && (
            <p className="error-message">{errors.contact_last_name.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="label-base">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className={`input-base ${errors.email ? 'input-error' : ''}`}
          placeholder="john.doe@example.com"
        />
        {errors.email && (
          <p className="error-message">{errors.email.message}</p>
        )}
      </div>

      {/* LinkedIn URL */}
      <div>
        <label htmlFor="linkedinUrl" className="label-base">
          LinkedIn Profile URL
          <span className="text-sm text-gray-500 ml-2">(Optional)</span>
        </label>
        <input
          type="url"
          id="linkedinUrl"
          {...register('linkedinUrl')}
          className={`input-base ${errors.linkedinUrl ? 'input-error' : ''}`}
          placeholder="https://linkedin.com/in/your-profile"
        />
        {errors.linkedinUrl && (
          <p className="error-message">{errors.linkedinUrl.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="label-base">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <select
              id="country_code"
              {...register('country_code')}
              className={`input-base ${errors.country_code ? 'input-error' : ''}`}
            >
              <option value="">Code</option>
              {PHONE_COUNTRY_CODE_OPTIONS.map((country, index) => (
                <option key={`${country.code}-${country.label}-${index}`} value={country.code}>
                  {country.code} {country.flag}
                </option>
              ))}
            </select>
            {errors.country_code && (
              <p className="error-message">{errors.country_code.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <input
              type="tel"
              id="phoneNumber"
              {...register('phoneNumber')}
              className={`input-base ${errors.phoneNumber ? 'input-error' : ''}`}
              placeholder="123 456 7890"
            />
            {errors.phoneNumber && (
              <p className="error-message">{errors.phoneNumber.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
