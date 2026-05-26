import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse startup products, templates, services, courses, and tools listed by verified Ventex founders.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    title: "Marketplace | Ventex",
    description: "Browse startup products, templates, services, courses, and tools listed by verified Ventex founders.",
    url: "/marketplace",
    type: "website",
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
