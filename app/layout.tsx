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
  metadataBase: new URL('https://ventexmkt-2lswoktz.manus.space/'),
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
    canonical: "https://ventexmkt-2lswoktz.manus.space/",
  },
  openGraph: {
    title: `${SITE_NAME} — Build what’s next`,
    description: `${SITE_NAME} is ${SITE_DESCRIPTION.charAt(0).toLowerCase() + SITE_DESCRIPTION.slice(1)}`,
    url: "https://ventexmkt-2lswoktz.manus.space/",
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Build what’s next`,
    description: `${SITE_NAME} is ${SITE_DESCRIPTION.charAt(0).toLowerCase() + SITE_DESCRIPTION.slice(1)}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased bg-[#10100f] text-[#f1efe8]`}>
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": SITE_NAME,
                "alternateName": [`${SITE_NAME} Platform`, `${SITE_NAME} Build Whats Next`],
                "url": "https://ventexmkt-2lswoktz.manus.space/",
                "description": `${SITE_NAME} is ${SITE_DESCRIPTION.charAt(0).toLowerCase() + SITE_DESCRIPTION.slice(1)}`,
                "knowsAbout": ["Startups", "Founder Network", "Pitch Decks", "Venture Capital"],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": SITE_NAME,
                "url": "https://ventexmkt-2lswoktz.manus.space/",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `https://ventexmkt-2lswoktz.manus.space/discover?q={search_term_string}`,
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
        <Layout>
          {children}
        </Layout>
        <Analytics />
      </body>
    </html>
  );
}
