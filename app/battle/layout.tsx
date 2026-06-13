import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Weekly Pitch Battle - Vote for the Best Startup",
 description: "Vote weekly for the strongest startup pitch. Winners get featured across the Ventexx network.",
 alternates: { canonical: "https://ventexx.com/battle" },
 openGraph: {
 title: "Weekly Pitch Battle - Vote for the Best Startup",
 description: "Vote weekly for the strongest startup pitch. Winners get featured across the Ventexx network.",
 url: "https://ventexx.com/battle",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "Weekly Pitch Battle - Vote for the Best Startup",
 description: "Vote weekly for the strongest startup pitch. Winners get featured across the Ventexx network.",
 images: [OG_IMAGE_URL],
 },
};

export default function BattleLayout({ children }: { children: React.ReactNode }) {
 return children;
}