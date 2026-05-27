import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invest in Startups — Ventex Investor Network",
  description: "Discover global startup deal flow. Find your next investment on Ventex.",
  alternates: { canonical: "/investors" },
  openGraph: {
    title: "Invest in Startups — Ventex Investor Network",
    description: "Discover global startup deal flow. Find your next investment on Ventex.",
    url: "/investors",
    type: "website",
    images: ["https://ventex.app/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invest in Startups — Ventex Investor Network",
    description: "Discover global startup deal flow. Find your next investment on Ventex.",
    images: ["https://ventex.app/og-image.png"],
  },
};

export default function InvestorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
