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
    default: "Ventex | Startup Pitch, Funding and Marketplace Platform",
    template: "%s | Ventex",
  },
  description: "Where startups pitch, fund and sell.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ventex | Startup Pitch, Funding and Marketplace Platform",
    description: "Where startups pitch, fund and sell.",
    url: "/",
    siteName: "Ventex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventex | Startup Pitch, Funding and Marketplace Platform",
    description: "Where startups pitch, fund and sell.",
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
