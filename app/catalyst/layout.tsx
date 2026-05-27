import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ventex Catalyst - Mentors and Investors for Founders",
  description: "Connect with mentors and investors who guide early-stage founders from idea to traction.",
  alternates: { canonical: "/catalyst" },
  openGraph: {
    title: "Ventex Catalyst - Mentors and Investors for Founders",
    description: "Connect with mentors and investors who guide early-stage founders from idea to traction.",
    url: "/catalyst",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventex Catalyst - Mentors and Investors for Founders",
    description: "Connect with mentors and investors who guide early-stage founders from idea to traction.",
    images: [OG_IMAGE_URL],
  },
};

export default function CatalystLayout({ children }: { children: React.ReactNode }) {
  return children;
}
