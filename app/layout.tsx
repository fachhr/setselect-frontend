import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";

// Only keep Inter (for the regular text)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
      {/* Removed playfair.variable */}
      <body className={`
        ${inter.variable} font-sans 
        bg-white text-slate-900 antialiased
        selection:bg-slate-200 selection:text-slate-900
      `}>
        {children}
      </body>
    </html>
  );
}