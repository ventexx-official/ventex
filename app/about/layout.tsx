import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Ventex — Built for Founders Worldwide",
  description: "Ventex is built for founders worldwide — pitch investors, sell products, and scale your startup.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Ventex — Built for Founders Worldwide",
    description: "Ventex is built for founders worldwide — pitch investors, sell products, and scale your startup.",
    url: "/about",
    type: "website",
    images: ["https://ventex.app/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Ventex — Built for Founders Worldwide",
    description: "Ventex is built for founders worldwide — pitch investors, sell products, and scale your startup.",
    images: ["https://ventex.app/og-image.png"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
