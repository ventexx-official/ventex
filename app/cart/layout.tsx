import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Ventex marketplace cart and continue to secure Stripe checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}