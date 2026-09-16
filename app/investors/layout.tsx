import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Invest in Startups - Folenzo Investor Network",
 description: "Access curated global startup deal flow. Discover your next investment on Folenzo.",
 alternates: { canonical: "https://folenzo.com/investors" },
 openGraph: {
 title: "Invest in Startups - Folenzo Investor Network",
 description: "Access curated global startup deal flow. Discover your next investment on Folenzo.",
 url: "https://folenzo.com/investors",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "Invest in Startups - Folenzo Investor Network",
 description: "Access curated global startup deal flow. Discover your next investment on Folenzo.",
 images: [OG_IMAGE_URL],
 },
};

export default function InvestorsLayout({ children }: { children: React.ReactNode }) {
 return children;
}