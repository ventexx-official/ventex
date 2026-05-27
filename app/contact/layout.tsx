import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Ventex",
  description: "Contact Ventex for support, bug reports, partnerships, press, and marketplace questions.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Ventex",
    description: "Contact Ventex for support, bug reports, partnerships, press, and marketplace questions.",
    url: "/contact",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Ventex",
    description: "Contact Ventex for support, bug reports, partnerships, press, and marketplace questions.",
    images: [OG_IMAGE_URL],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
