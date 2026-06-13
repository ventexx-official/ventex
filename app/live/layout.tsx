import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Ventexx Live - Monthly Startup Pitch Night",
 description: "Watch founders pitch to real investors every month on Ventexx Live. Apply to pitch or judge.",
 alternates: { canonical: "/live" },
 openGraph: {
 title: "Ventexx Live - Monthly Startup Pitch Night",
 description: "Watch founders pitch to real investors every month on Ventexx Live. Apply to pitch or judge.",
 url: "/live",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "Ventexx Live - Monthly Startup Pitch Night",
 description: "Watch founders pitch to real investors every month on Ventexx Live. Apply to pitch or judge.",
 images: [OG_IMAGE_URL],
 },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
 return children;
}