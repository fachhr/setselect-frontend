'use client';

import { ZenModeProvider } from '@/contexts/ZenModeContext';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <CookieConsentProvider>
            <AuthProvider>
                <ZenModeProvider>
                    {children}
                </ZenModeProvider>
            </AuthProvider>
        </CookieConsentProvider>
    );
}
