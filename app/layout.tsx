import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { Analytics } from '@vercel/analytics/react';

import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/brand";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ventexx.com'),
  title: {
    default: `${SITE_NAME} — Build what’s next`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_NAME} is ${SITE_DESCRIPTION.charAt(0).toLowerCase() + SITE_DESCRIPTION.slice(1)}`,
  keywords: ["Startup Platform", SITE_NAME, "Build Whats Next", "Founder Network", "Pitch Deck", "Marketplace"],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://www.ventexx.com",
  },
  openGraph: {
    title: `${SITE_NAME} — Build what’s next`,
    description: `${SITE_NAME} is ${SITE_DESCRIPTION.charAt(0).toLowerCase() + SITE_DESCRIPTION.slice(1)}`,
    url: "https://www.ventexx.com",
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Build what’s next`,
    description: `${SITE_NAME} is ${SITE_DESCRIPTION.charAt(0).toLowerCase() + SITE_DESCRIPTION.slice(1)}`,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10100f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      <body className="bg-[var(--ink)] text-[var(--paper)] font-sans antialiased overflow-x-hidden selection:bg-[var(--red)] selection:text-[var(--paper)]">
        <Layout>
          {children}
        </Layout>
        <Analytics />
      </body>
    </html>
  );
}
