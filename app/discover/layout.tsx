import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Discover Startups Raising Now - Ventex",
  description: "Browse investor-ready startups raising now. Filter by sector, stage, and traction signals.",
  alternates: { canonical: "/discover" },
  openGraph: {
    title: "Discover Startups Raising Now - Ventex",
    description: "Browse investor-ready startups raising now. Filter by sector, stage, and traction signals.",
    url: "/discover",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Startups Raising Now - Ventex",
    description: "Browse investor-ready startups raising now. Filter by sector, stage, and traction signals.",
    images: [OG_IMAGE_URL],
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
