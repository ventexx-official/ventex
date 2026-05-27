import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Ventex Plans for Founders and Investors",
  description: "Simple, transparent pricing for founders, investors, and marketplace buyers. Free tiers available.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing — Ventex Plans for Founders and Investors",
    description: "Simple, transparent pricing for founders, investors, and marketplace buyers. Free tiers available.",
    url: "/pricing",
    type: "website",
    images: ["https://ventex.app/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Ventex Plans for Founders and Investors",
    description: "Simple, transparent pricing for founders, investors, and marketplace buyers. Free tiers available.",
    images: ["https://ventex.app/og-image.png"],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
