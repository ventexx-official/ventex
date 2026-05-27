import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Marketplace - Buy Startup Tools, Templates & Products | Ventex",
  description: "Buy software products, hire freelance developers, or post a job for your startup.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    title: "Marketplace - Buy Startup Tools, Templates & Products | Ventex",
    description: "Buy software products, hire freelance developers, or post a job for your startup.",
    url: "/marketplace",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketplace - Buy Startup Tools, Templates & Products | Ventex",
    description: "Buy software products, hire freelance developers, or post a job for your startup.",
    images: [OG_IMAGE_URL],
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
