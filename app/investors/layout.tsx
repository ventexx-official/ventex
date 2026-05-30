import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Invest in Startups — Ventex Investor Network",
  description: "Access curated global startup deal flow. Discover your next investment on Ventex.",
  alternates: { canonical: "https://ventex-eight.vercel.app/investors" },
  openGraph: {
    title: "Invest in Startups — Ventex Investor Network",
    description: "Access curated global startup deal flow. Discover your next investment on Ventex.",
    url: "https://ventex-eight.vercel.app/investors",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invest in Startups — Ventex Investor Network",
    description: "Access curated global startup deal flow. Discover your next investment on Ventex.",
    images: [OG_IMAGE_URL],
  },
};

export default function InvestorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
