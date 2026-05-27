import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Ventex - India's Startup Pitch & Funding Platform",
  description: "Learn about Ventex, the platform built for Indian founders, investors, and startup sellers.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Ventex - India's Startup Pitch & Funding Platform",
    description: "Learn about Ventex, the platform built for Indian founders, investors, and startup sellers.",
    url: "/about",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Ventex - India's Startup Pitch & Funding Platform",
    description: "Learn about Ventex, the platform built for Indian founders, investors, and startup sellers.",
    images: [OG_IMAGE_URL],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
