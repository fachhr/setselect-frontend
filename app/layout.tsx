import type { Metadata } from "next";
import { Inter, Playfair_Display } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import "./globals.css";

// Inter for body text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Ensure font displays immediately with fallback
  preload: true,   // Preload for faster initial render
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true, // Match fallback font metrics to Inter
});

// Playfair Display for serif accents
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Silvia's List - Top Swiss Tech Talent",
  description: "Discover pre-screened tech talent in Switzerland.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`
        ${inter.variable} ${playfair.variable} font-sans
      `}>
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}