import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Marketplace Ã¢â‚¬â€ Premium Startup Assets",
  description: "Buy and sell premium tools, documents, and resources built by founders.",
  alternates: {
    canonical: "https://ventexx.com/marketplace",
  },
  openGraph: {
    title: "Marketplace Ã¢â‚¬â€ Premium Startup Assets",
    description: "Buy and sell premium tools, documents, and resources built by founders.",
    url: "https://ventexx.com/marketplace",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketplace Ã¢â‚¬â€ Premium Startup Assets",
    description: "Buy and sell premium tools, documents, and resources built by founders.",
    images: [OG_IMAGE_URL],
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}