import type { Metadata } from "next";
import FounderGuard from "@/components/FounderGuard";

export const metadata: Metadata = {
  title: "Founder Dashboard",
  robots: { index: false, follow: false },
};

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  return <FounderGuard>{children}</FounderGuard>;
}
