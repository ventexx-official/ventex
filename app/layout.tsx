import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { Analytics } from '@vercel/analytics/react';

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
  metadataBase: new URL('https://folenzomkt-2lswoktz.manus.space/'),
  title: {
    default: "Folenzo — Build what’s next",
    template: "%s | Folenzo",
  },
  description: "Folenzo is the living layer between a good idea and the people who can make it matter.",
  keywords: ["Startup Platform", "Folenzo", "Build Whats Next", "Founder Network", "Pitch Deck", "Marketplace"],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://folenzomkt-2lswoktz.manus.space/",
  },
  openGraph: {
    title: "Folenzo — Build what’s next",
    description: "Folenzo is the living layer between a good idea and the people who can make it matter.",
    url: "https://folenzomkt-2lswoktz.manus.space/",
    siteName: "Folenzo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Folenzo — Build what’s next",
    description: "Folenzo is the living layer between a good idea and the people who can make it matter.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased bg-[#10100f] text-[#f1efe8]`}>
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Folenzo",
                "alternateName": ["Folenzo Platform", "Folenzo Build Whats Next"],
                "url": "https://folenzomkt-2lswoktz.manus.space/",
                "description": "Folenzo is the living layer between a good idea and the people who can make it matter.",
                "knowsAbout": ["Startups", "Founder Network", "Pitch Decks", "Venture Capital"],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Folenzo",
                "url": "https://folenzomkt-2lswoktz.manus.space/",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://folenzomkt-2lswoktz.manus.space/discover?q={search_term_string}",
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
