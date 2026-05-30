import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ventex Marketplace — Premium Startup Assets",
  description: "Buy and sell premium tools, documents, and resources built by founders.",
  alternates: {
    canonical: "https://ventex-eight.vercel.app/marketplace",
  },
  openGraph: {
    title: "Ventex Marketplace — Premium Startup Assets",
    description: "Buy and sell premium tools, documents, and resources built by founders.",
    url: "https://ventex-eight.vercel.app/marketplace",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventex Marketplace — Premium Startup Assets",
    description: "Buy and sell premium tools, documents, and resources built by founders.",
    images: [OG_IMAGE_URL],
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
