import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a Ventex access plan for startup discovery, marketplace tools, pitch research, and investor workflows.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing | Ventex",
    description: "Choose a Ventex access plan for startup discovery, marketplace tools, pitch research, and investor workflows.",
    url: "/pricing",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
