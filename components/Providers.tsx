'use client';

import { ZenModeProvider } from '@/contexts/ZenModeContext';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <CookieConsentProvider>
            <ZenModeProvider>
                {children}
            </ZenModeProvider>
        </CookieConsentProvider>
    );
}
