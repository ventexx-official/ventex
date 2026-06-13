import type { Metadata } from "next";
import InvestorGuard from "@/components/InvestorGuard";

export const metadata: Metadata = {
  title: "Investor Portal",
  robots: { index: false, follow: false },
};

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return <InvestorGuard>{children}</InvestorGuard>;
}
