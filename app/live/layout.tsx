import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ventex Live - Monthly Startup Pitch Night",
  description: "Watch founders pitch to real investors every month on Ventex Live. Apply to pitch or judge.",
  alternates: { canonical: "/live" },
  openGraph: {
    title: "Ventex Live - Monthly Startup Pitch Night",
    description: "Watch founders pitch to real investors every month on Ventex Live. Apply to pitch or judge.",
    url: "/live",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventex Live - Monthly Startup Pitch Night",
    description: "Watch founders pitch to real investors every month on Ventex Live. Apply to pitch or judge.",
    images: [OG_IMAGE_URL],
  },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
