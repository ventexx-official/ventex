import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Invest in Startups - Ventexx Investor Network",
 description: "Access curated global startup deal flow. Discover your next investment on Ventexx.",
 alternates: { canonical: "https://ventexx.com/investors" },
 openGraph: {
 title: "Invest in Startups - Ventexx Investor Network",
 description: "Access curated global startup deal flow. Discover your next investment on Ventexx.",
 url: "https://ventexx.com/investors",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "Invest in Startups - Ventexx Investor Network",
 description: "Access curated global startup deal flow. Discover your next investment on Ventexx.",
 images: [OG_IMAGE_URL],
 },
};

export default function InvestorsLayout({ children }: { children: React.ReactNode }) {
 return children;
}