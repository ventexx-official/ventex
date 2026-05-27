import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Ventex",
  description: "Contact Ventex for support, bug reports, partnerships, press, and marketplace questions.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Ventex",
    description: "Contact Ventex for support, bug reports, partnerships, press, and marketplace questions.",
    url: "/contact",
    type: "website",
    images: ["https://ventex.app/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Ventex",
    description: "Contact Ventex for support, bug reports, partnerships, press, and marketplace questions.",
    images: ["https://ventex.app/og-image.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
