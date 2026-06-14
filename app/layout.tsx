import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { Analytics } from '@vercel/analytics/react'

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
 metadataBase: new URL('https://ventexx.com'),
 title: {
  default: "Ventexx — Where Startups Pitch, Fund and Sell",
  template: "%s | Ventexx",
 },
 description: "A startup ecosystem connecting founders, investors, buyers, and opportunities.",
 robots: {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
 },
 alternates: {
  canonical: "https://ventexx.com",
 },
 openGraph: {
  title: "Ventexx — Where Startups Pitch, Fund and Sell",
  description: "A startup ecosystem connecting founders, investors, buyers, and opportunities.",
  url: "https://ventexx.com",
  siteName: "Ventexx",
  type: "website",
  images: [
   {
    url: "https://ventexx.com/api/og",
    width: 1200,
    height: 630,
    alt: "Ventexx — Where Startups Pitch, Fund and Sell",
   }
  ],
 },
 twitter: {
  card: "summary_large_image",
  title: "Ventexx — Where Startups Pitch, Fund and Sell",
  description: "A startup ecosystem connecting founders, investors, buyers, and opportunities.",
  images: ["https://ventexx.com/api/og"],
 },
 icons: {
  icon: [
   { url: "/favicon.ico", sizes: "any" },
   { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
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
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Ventexx",
        "url": "https://ventexx.com",
        "logo": "https://ventexx.com/icon.png",
        "description": "A startup ecosystem connecting founders, investors, buyers, and opportunities.",
        "sameAs": [
          "https://x.com/ventex_hq",
          "https://www.linkedin.com/in/ventexx",
          "https://www.instagram.com/ventexhq/",
          "https://youtube.com/@ventexhq"
        ]
      })
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
