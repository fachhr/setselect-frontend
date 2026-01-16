import type { Metadata } from "next";
import { Montserrat } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import "./globals.css";

// Montserrat for body text and headings
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

// Behind the Nineties for titles - using local font
// NOTE: Add BehindTheNineties.woff2 to /public/fonts/ to enable
// For now, fallback to Montserrat
// import localFont from 'next/font/local';
// const behindTheNineties = localFont({
//   src: '../public/fonts/BehindTheNineties.woff2',
//   variable: '--font-behind-the-nineties',
//   weight: '500',
//   display: 'swap',
// });

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
      <body className={`${montserrat.variable} font-sans`}>
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}