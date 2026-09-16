import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Folenzo Catalyst - Find Co-founders and Advisors",
 description: "Match with top-tier co-founders, advisors, and fractional executives.",
 alternates: { canonical: "https://folenzo.com/catalyst" },
 openGraph: {
 title: "Folenzo Catalyst - Find Co-founders and Advisors",
 description: "Match with top-tier co-founders, advisors, and fractional executives.",
 url: "https://folenzo.com/catalyst",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "Folenzo Catalyst - Find Co-founders and Advisors",
 description: "Match with top-tier co-founders, advisors, and fractional executives.",
 images: [OG_IMAGE_URL],
 },
};

export default function CatalystLayout({ children }: { children: React.ReactNode }) {
 return children;
}