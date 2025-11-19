import { useState, useEffect } from 'react';

/**
 * Hook to detect if the viewport is mobile-sized
 * @returns boolean indicating if viewport width is less than 1024px (lg breakpoint)
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        // Check on mount
        checkIsMobile();

        // Add event listener
        window.addEventListener('resize', checkIsMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    // During SSR or before mount, assume desktop to avoid hydration mismatch
    return mounted ? isMobile : false;
}
