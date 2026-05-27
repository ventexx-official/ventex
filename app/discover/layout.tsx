import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Startups Raising Now — Ventex",
  description: "Browse investor-ready startups raising now. Filter by sector, stage, and traction signals.",
  alternates: { canonical: "/discover" },
  openGraph: {
    title: "Discover Startups Raising Now — Ventex",
    description: "Browse investor-ready startups raising now. Filter by sector, stage, and traction signals.",
    url: "/discover",
    type: "website",
    images: ["https://ventex.app/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Startups Raising Now — Ventex",
    description: "Browse investor-ready startups raising now. Filter by sector, stage, and traction signals.",
    images: ["https://ventex.app/og-image.png"],
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
