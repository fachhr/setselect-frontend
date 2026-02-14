import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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

export const metadata: Metadata = {
  title: 'SetSelect — Recruiter Console',
  description: 'Internal recruiter dashboard for SetSelect talent management',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${behindTheNineties.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
