import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Discover Startups — Ventex",
  description: "Find and invest in the top 1% of emerging startups.",
  alternates: { canonical: "https://ventex-eight.vercel.app/discover" },
  openGraph: {
    title: "Discover Startups — Ventex",
    description: "Find and invest in the top 1% of emerging startups.",
    url: "https://ventex-eight.vercel.app/discover",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Startups — Ventex",
    description: "Find and invest in the top 1% of emerging startups.",
    images: [OG_IMAGE_URL],
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
