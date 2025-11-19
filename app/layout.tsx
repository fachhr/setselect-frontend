import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import Header from "@/components/layout/Header";

const gilroy = localFont({
  src: [
    {
      path: './fonts/Gilroy-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Gilroy-ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-gilroy',
});

export const metadata: Metadata = {
  title: "Silvia's List - Discover Top Swiss Tech Talent",
  description: "Browse exceptional tech talent in Switzerland. Discover pre-screened professionals ready for their next opportunity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={gilroy.variable} style={{ fontFamily: 'var(--font-gilroy), Arial, sans-serif' }}>
        <Header />
        {children}
      </body>
    </html>
  );
}
