import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ventex Catalyst — Mentors and Investors for Founders",
  description: "Connect with mentors and investors who guide early-stage founders from idea to traction.",
  alternates: { canonical: "/catalyst" },
  openGraph: {
    title: "Ventex Catalyst — Mentors and Investors for Founders",
    description: "Connect with mentors and investors who guide early-stage founders from idea to traction.",
    url: "/catalyst",
    type: "website",
    images: ["https://ventex.app/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventex Catalyst — Mentors and Investors for Founders",
    description: "Connect with mentors and investors who guide early-stage founders from idea to traction.",
    images: ["https://ventex.app/og-image.png"],
  },
};

export default function CatalystLayout({ children }: { children: React.ReactNode }) {
  return children;
}
