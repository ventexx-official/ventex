import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Ventex — The Global Startup Platform",
  description: "Ventex is the platform where startups pitch investors, sell products, and find the right supporters worldwide.",
  alternates: { canonical: "https://ventex-eight.vercel.app/about" },
  openGraph: {
    title: "About Ventex — The Global Startup Platform",
    description: "Ventex is the platform where startups pitch investors, sell products, and find the right supporters worldwide.",
    url: "https://ventex-eight.vercel.app/about",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Ventex — The Global Startup Platform",
    description: "Ventex is the platform where startups pitch investors, sell products, and find the right supporters worldwide.",
    images: [OG_IMAGE_URL],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
