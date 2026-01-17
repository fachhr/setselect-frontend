'use client';

import { useEffect, useState, useCallback } from 'react';

const RECAPTCHA_SCRIPT_ID = 'recaptcha-v3-script';

interface UseRecaptchaReturn {
  /** Whether reCAPTCHA script is loaded and ready */
  isReady: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Execute reCAPTCHA and get a token for the given action */
  executeRecaptcha: (action: string) => Promise<string>;
}

/**
 * Custom hook for Google reCAPTCHA v3
 *
 * Loads the reCAPTCHA script asynchronously and provides a function
 * to execute reCAPTCHA for form submissions.
 *
 * @example
 * const { isReady, error, executeRecaptcha } = useRecaptcha();
 *
 * const handleSubmit = async () => {
 *   const token = await executeRecaptcha('join_form');
 *   // Send token to API for verification
 * };
 */
export function useRecaptcha(): UseRecaptchaReturn {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      // In development, allow form submission without reCAPTCHA
      console.warn('[reCAPTCHA] Site key not configured');
      setIsReady(true);
      return;
    }

    // Check if script is already loaded
    if (document.getElementById(RECAPTCHA_SCRIPT_ID)) {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setIsReady(true));
      }
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.grecaptcha.ready(() => {
        setIsReady(true);
      });
    };

    script.onerror = () => {
      setError('Failed to load reCAPTCHA. Please refresh the page.');
    };

    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      // Note: We don't remove the script as other components may use it
    };
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    // In development without keys, return empty token
    if (!siteKey) {
      console.warn('[reCAPTCHA] Skipping - no site key configured');
      return '';
    }

    if (!window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded');
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (err) {
      console.error('[reCAPTCHA] Execution failed:', err);
      throw new Error('Unable to verify you are human. Please refresh and try again.');
    }
  }, []);

  return { isReady, error, executeRecaptcha };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
