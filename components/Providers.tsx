'use client';

import { ZenModeProvider } from '@/contexts/ZenModeContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ZenModeProvider>
            {children}
        </ZenModeProvider>
    );
}
