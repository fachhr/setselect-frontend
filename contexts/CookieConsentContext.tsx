'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ConsentState = 'pending' | 'accepted' | 'rejected';

interface CookieConsentContextType {
  consent: ConsentState;
  hasConsent: boolean;
  acceptCookies: () => void;
  rejectCookies: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const CONSENT_KEY = 'cookie-consent';

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>('pending');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
    }
    setIsLoaded(true);
  }, []);

  const acceptCookies = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
  }, []);

  const rejectCookies = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setConsent('rejected');
  }, []);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY);
    setConsent('pending');
  }, []);

  // Don't render children until we've loaded the consent state
  // This prevents flash of banner for users who have already consented
  if (!isLoaded) {
    return null;
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsent: consent === 'accepted',
        acceptCookies,
        rejectCookies,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
