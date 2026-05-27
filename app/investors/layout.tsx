import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Invest in Startups - Ventex Investor Network",
  description: "Discover India-first startup deal flow. Find your next investment on Ventex.",
  alternates: { canonical: "/investors" },
  openGraph: {
    title: "Invest in Startups - Ventex Investor Network",
    description: "Discover India-first startup deal flow. Find your next investment on Ventex.",
    url: "/investors",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invest in Startups - Ventex Investor Network",
    description: "Discover India-first startup deal flow. Find your next investment on Ventex.",
    images: [OG_IMAGE_URL],
  },
};

export default function InvestorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
