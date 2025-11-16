'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { talentPoolSchemaRefined, type TalentPoolFormData } from '@/lib/validation/talentPoolSchema';
import { CVUploadSection } from './forms/CVUploadSection';
import { ContactDetailsSection } from './forms/ContactDetailsSection';
import { PreferencesSection } from './forms/PreferencesSection';
import { TermsSection } from './forms/TermsSection';
import { MessageDisplay } from './ui/MessageDisplay';

export function TalentPoolForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    setError
  } = useForm<TalentPoolFormData>({
    resolver: zodResolver(talentPoolSchemaRefined),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      working_capacity_percent: 50,
      salary_min: 0,
      salary_max: 50000,
      salary_confidential: false,
      desired_locations: [],
    }
  });

  // Scroll to first error field when validation fails
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField) ||
                          document.querySelector(`[name="${firstErrorField}"]`);

      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        // Optional: focus the field for better UX
        if (errorElement instanceof HTMLElement) {
          errorElement.focus({ preventScroll: true });
        }
      }
    }
  }, [errors]);

  const onSubmit = async (data: TalentPoolFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Step 1: Upload CV and get storage path
      if (!cvFile) {
        setError('cvFile', { message: 'Please upload your CV' });
        setIsSubmitting(false);
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', cvFile);

      const uploadResponse = await fetch('/api/talent-pool/upload-cv', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload CV');
      }

      const uploadData = await uploadResponse.json();

      // Step 2: Submit profile with CV info
      const profileData = {
        ...data,
        cvStoragePath: uploadData.cvStoragePath,
        originalFilename: uploadData.originalFilename,
      };

      const submitResponse = await fetch('/api/talent-pool/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || 'Failed to submit profile');
      }

      const submitData = await submitResponse.json();

      // Success! Redirect to success page
      router.push('/success');

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const handleCVFileSelect = (file: File | null) => {
    setCvFile(file);
    if (file) {
      setValue('cvFile', file, { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Submit Error Message */}
      {submitError && (
        <MessageDisplay
          type="error"
          message={submitError}
          onDismiss={() => setSubmitError(null)}
        />
      )}

      {/* Form Sections - Separate Cards */}
      <div className="space-y-6">
        {/* Section 1: CV Upload */}
        <div className="bg-[var(--light)] rounded-xl shadow-lg p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Upload Your CV</h2>
            <p className="text-[var(--dark-600)]">
              Start by uploading your CV. We'll use it to understand your professional background.
            </p>
          </div>
          <CVUploadSection
            onFileSelect={handleCVFileSelect}
            error={errors.cvFile?.message}
            disabled={isSubmitting}
          />
        </div>

        {/* Section 2: Contact Details */}
        <div className="bg-[var(--light)] rounded-xl shadow-lg p-6 sm:p-8">
          <ContactDetailsSection
            register={register}
            errors={errors}
          />
        </div>

        {/* Section 3: Job Preferences */}
        <div className="bg-[var(--light)] rounded-xl shadow-lg p-6 sm:p-8">
          <PreferencesSection
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>

        {/* Section 4: Terms & Submit */}
        <div className="bg-[var(--light)] rounded-xl shadow-lg p-6 sm:p-8">
          <TermsSection
            register={register}
            errors={errors}
            allErrors={errors}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </form>
  );
}
