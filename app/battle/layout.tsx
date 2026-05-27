import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Pitch Battle — Vote for the Best Startup — Ventex",
  description: "Vote weekly for the strongest startup pitch. Winners get featured across the Ventex network.",
  alternates: { canonical: "/battle" },
  openGraph: {
    title: "Weekly Pitch Battle — Vote for the Best Startup — Ventex",
    description: "Vote weekly for the strongest startup pitch. Winners get featured across the Ventex network.",
    url: "/battle",
    type: "website",
    images: ["https://ventex.app/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weekly Pitch Battle — Vote for the Best Startup — Ventex",
    description: "Vote weekly for the strongest startup pitch. Winners get featured across the Ventex network.",
    images: ["https://ventex.app/og-image.png"],
  },
};

export default function BattleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
