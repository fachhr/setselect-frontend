import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}
