import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ventex-eight.vercel.app"),
  title: {
    default: "Ventex — Where Startups Pitch, Fund and Sell",
    template: "%s | Ventex",
  },
  description: "The global platform where startups pitch to investors, sell products, and hire developers.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ventex — Where Startups Pitch, Fund and Sell",
    description: "The global platform where startups pitch to investors, sell products, and hire developers.",
    url: "/",
    siteName: "Ventex",
    type: "website",
    images: ["https://ventex.app/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventex — Where Startups Pitch, Fund and Sell",
    description: "The global platform where startups pitch to investors, sell products, and hire developers.",
    images: ["https://ventex.app/og-image.png"],
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
              const t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
              document.documentElement.classList.add('js');
              document.documentElement.setAttribute('data-theme',t);
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
