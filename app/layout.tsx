import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { BASE_URL, OG_IMAGE_URL } from "@/lib/site";
import { Analytics } from '@vercel/analytics/react'

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-inter", // Keep variable name to avoid massive CSS changes, but it's Jakarta now
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
  title: "Ventex Ã¢â‚¬â€ Where Startups Pitch, Fund and Sell",
  description: "The platform for founders, investors, and startup builders worldwide. Pitch investors, raise funding, and sell digital products.",
  robots: "index, follow",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ventex Ã¢â‚¬â€ Where Startups Pitch, Fund and Sell",
    description: "The platform for founders, investors, and startup builders worldwide. Pitch investors, raise funding, and sell digital products.",
    url: "https://ventexx.com",
    siteName: "Ventex",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const t=localStorage.getItem('theme')||'light';
              document.documentElement.classList.add('js');
              document.documentElement.setAttribute('data-theme',t);
            `,
          }}
        />
      </head>
      <body className={`${jakarta.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased`}>
        <Layout>
          {children}
        </Layout>
        <Analytics />
      </body>
    </html>
  );
}