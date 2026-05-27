import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startup Marketplace — Buy Software, Hire Developers — Ventex",
  description: "Buy software products, hire freelance developers, or post a job for your startup.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    title: "Startup Marketplace — Buy Software, Hire Developers — Ventex",
    description: "Buy software products, hire freelance developers, or post a job for your startup.",
    url: "/marketplace",
    type: "website",
    images: ["https://ventex.app/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Startup Marketplace — Buy Software, Hire Developers — Ventex",
    description: "Buy software products, hire freelance developers, or post a job for your startup.",
    images: ["https://ventex.app/og-image.png"],
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
