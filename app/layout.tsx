import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { Analytics } from '@vercel/analytics/react'
import KofiSupport from "@/components/KofiSupport";

const jakarta = Plus_Jakarta_Sans({
 subsets: ["latin"],
 variable: "--font-inter",
 display: "swap",
});

const spaceGrotesk = Space_Grotesk({
 subsets: ["latin"],
 variable: "--font-space",
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
  default: "Ventex | Startup Marketplace for Founders and Investors",
  template: "%s | Ventex",
 },
 description: "Ventex is a startup marketplace where founders pitch startups, connect with investors, raise funding, discover opportunities, and grow their ventures.",
 keywords: ["Startup Marketplace", "Startup Pitch Platform", "Founder Discovery Platform", "Investor Discovery Platform", "Startup Funding Platform", "Ventex"],
 robots: {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
 },
 alternates: {
  canonical: "https://www.ventexx.com",
 },
 openGraph: {
  title: "Ventex | Startup Marketplace for Founders and Investors",
  description: "Ventex is a startup marketplace where founders pitch startups, connect with investors, raise funding, discover opportunities, and grow their ventures.",
  url: "https://www.ventexx.com",
  siteName: "Ventex",
  type: "website",
  images: [
   {
    url: "https://www.ventexx.com/logo-512.png",
    width: 512,
    height: 512,
    alt: "Ventex Logo",
   }
  ],
 },
 twitter: {
  card: "summary_large_image",
  title: "Ventex | Startup Marketplace for Founders and Investors",
  description: "Ventex is a startup marketplace where founders pitch startups, connect with investors, raise funding, discover opportunities, and grow their ventures.",
  images: ["https://www.ventexx.com/logo-512.png"],
 },
 icons: {
  icon: [
   { url: "/favicon.ico", sizes: "any" },
   { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
   { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
   { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
   { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
  ],
  apple: "/apple-touch-icon.png",
 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <html lang="en" suppressHydrationWarning>
  <head>
  <link rel="manifest" href="/site.webmanifest" />
  <script
   dangerouslySetInnerHTML={{
    __html: `
    const t=localStorage.getItem('theme')||'dark';
    document.documentElement.classList.add('js');
    document.documentElement.setAttribute('data-theme',t);
    `,
   }}
  />
  </head>
  <body className={`${jakarta.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased`}>
  {/* JSON-LD Schema */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify([
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Ventex",
          "alternateName": ["Ventex Startup Marketplace", "Ventex Pitch Platform"],
          "url": "https://www.ventexx.com",
          "logo": "https://www.ventexx.com/logo.png",
          "description": "Ventex is a global startup marketplace and pitch platform connecting ambitious founders with verified investors.",
          "knowsAbout": ["Startup Funding", "Venture Capital", "Startup Marketplace", "Angel Investing", "Pitch Decks"],
          "sameAs": [
            "https://x.com/ventex_hq",
            "https://www.linkedin.com/in/ventex",
            "https://www.instagram.com/ventexhq/",
            "https://youtube.com/@ventexhq"
          ]
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Ventex",
          "url": "https://www.ventexx.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.ventexx.com/discover?q={search_term_string}",
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
  <KofiSupport />
  </body>
  </html>
 );
}
