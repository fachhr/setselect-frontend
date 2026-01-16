import type { Metadata } from "next";
import { Montserrat } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import "./globals.css";

/**
 * Font Configuration
 * ==================
 *
 * Primary: Montserrat (Google Fonts - auto-optimized by Next.js)
 * Title:   Behind the Nineties (loaded via CSS @font-face in globals.css)
 *
 * The title font uses CSS @font-face for graceful fallback:
 * - If font file exists: uses custom font
 * - If missing: silently falls back to Montserrat
 *
 * To enable: Add BehindTheNineties.woff2 to public/fonts/
 */

// Montserrat - Primary font for body text and UI
// Using next/font/google for automatic optimization:
// - Self-hosted (no external requests)
// - Zero layout shift (size-adjusted fallback)
// - Preloaded for critical path
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "SetSelect - Top Swiss Tech Talent",
  description: "Discover pre-screened tech talent in Switzerland.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}