'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ZenModeContextType {
    isZenMode: boolean;
    toggleZenMode: () => void;
    setZenMode: (value: boolean) => void;
}

const ZenModeContext = createContext<ZenModeContextType | undefined>(undefined);

export function ZenModeProvider({ children }: { children: ReactNode }) {
    const [isZenMode, setIsZenMode] = useState(false);

    const toggleZenMode = () => setIsZenMode(prev => !prev);

    return (
        <ZenModeContext.Provider value={{ isZenMode, toggleZenMode, setZenMode: setIsZenMode }}>
            {children}
        </ZenModeContext.Provider>
    );
}

export function useZenMode() {
    const context = useContext(ZenModeContext);
    if (context === undefined) {
        throw new Error('useZenMode must be used within a ZenModeProvider');
    }
    return context;
}
