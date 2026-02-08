import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import { Analytics } from '@/components/Analytics';
import { CookieBanner } from '@/components/CookieBanner';
import "./globals.css";

/**
 * Font Configuration
 * ==================
 *
 * Primary: Inter (Google Fonts - auto-optimized by Next.js)
 * Title:   Behind the Nineties (local font with multiple weights)
 */

// Behind the Nineties - Title/Display font
const behindTheNineties = localFont({
  src: [
    { path: '../public/fonts/Behind-The-Nineties-Rg.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Behind-The-Nineties-It.otf', weight: '400', style: 'italic' },
    { path: '../public/fonts/Behind-The-Nineties-Md.otf', weight: '500', style: 'normal' },
    { path: '../public/fonts/Behind-The-Nineties-Smbd.otf', weight: '600', style: 'normal' },
    { path: '../public/fonts/Behind-The-Nineties-Bd.otf', weight: '700', style: 'normal' },
    { path: '../public/fonts/Behind-The-Nineties-Xbd.otf', weight: '800', style: 'normal' },
    { path: '../public/fonts/Behind-The-Nineties-Blk.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-title',
  display: 'swap',
});

// Inter - Primary font for body text and UI
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "SetSelect - Energy & Commodities Talent in Switzerland",
  description: "Browse pre-screened and selected energy & commodities talent in Switzerland.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${behindTheNineties.variable} font-sans antialiased`}>
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}