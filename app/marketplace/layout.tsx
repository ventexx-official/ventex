import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Marketplace - Premium Startup Assets",
 description: "Buy and sell premium tools, documents, and resources built by founders.",
 alternates: {
 canonical: "https://ventex.com/marketplace",
 },
 openGraph: {
 title: "Marketplace - Premium Startup Assets",
 description: "Buy and sell premium tools, documents, and resources built by founders.",
 url: "https://ventex.com/marketplace",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "Marketplace - Premium Startup Assets",
 description: "Buy and sell premium tools, documents, and resources built by founders.",
 images: [OG_IMAGE_URL],
 },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
 return children;
}