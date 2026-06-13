import type { Metadata } from "next";
import BuyerGuard from "@/components/BuyerGuard";

export const metadata: Metadata = {
  title: "Buyer Dashboard",
  robots: { index: false, follow: false },
};

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <BuyerGuard>{children}</BuyerGuard>;
}
