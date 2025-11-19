import React from 'react';
import { FieldErrors } from 'react-hook-form';

// Error icon component - circle X (matches original design)
const ErrorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
);

interface ErrorSummaryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
}

export function ErrorSummary({ errors }: ErrorSummaryProps) {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="error-summary" role="alert" aria-live="polite">
      <h3>
        <ErrorIcon className="w-4 h-4 flex-shrink-0" />
        <span>Please correct the highlighted errors above.</span>
      </h3>
    </div>
  );
}