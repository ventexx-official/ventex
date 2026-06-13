import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Ventexx Catalyst - Find Co-founders and Advisors",
 description: "Match with top-tier co-founders, advisors, and fractional executives.",
 alternates: { canonical: "https://ventexx.com/catalyst" },
 openGraph: {
 title: "Ventexx Catalyst - Find Co-founders and Advisors",
 description: "Match with top-tier co-founders, advisors, and fractional executives.",
 url: "https://ventexx.com/catalyst",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "Ventexx Catalyst - Find Co-founders and Advisors",
 description: "Match with top-tier co-founders, advisors, and fractional executives.",
 images: [OG_IMAGE_URL],
 },
};

export default function CatalystLayout({ children }: { children: React.ReactNode }) {
 return children;
}