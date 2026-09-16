import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Weekly Pitch Battle - Vote for the Best Startup",
 description: "Vote weekly for the strongest startup pitch. Winners get featured across the Folenzo network.",
 alternates: { canonical: "https://folenzo.com/battle" },
 openGraph: {
 title: "Weekly Pitch Battle - Vote for the Best Startup",
 description: "Vote weekly for the strongest startup pitch. Winners get featured across the Folenzo network.",
 url: "https://folenzo.com/battle",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "Weekly Pitch Battle - Vote for the Best Startup",
 description: "Vote weekly for the strongest startup pitch. Winners get featured across the Folenzo network.",
 images: [OG_IMAGE_URL],
 },
};

export default function BattleLayout({ children }: { children: React.ReactNode }) {
 return children;
}