import "./globals.css";

import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-latin"
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "500", "700", "800"]
});

export const metadata: Metadata = {
  title: "Darak",
  description: "Trusted Algerian real estate marketplace and property management platform."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={`${inter.variable} ${tajawal.variable} bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
