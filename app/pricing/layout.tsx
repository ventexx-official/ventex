import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing - Ventex Plans for Founders and Investors",
  description: "Simple, transparent pricing for founders, investors, and marketplace buyers. Free tiers available.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing - Ventex Plans for Founders and Investors",
    description: "Simple, transparent pricing for founders, investors, and marketplace buyers. Free tiers available.",
    url: "/pricing",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - Ventex Plans for Founders and Investors",
    description: "Simple, transparent pricing for founders, investors, and marketplace buyers. Free tiers available.",
    images: [OG_IMAGE_URL],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
