import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pitch of the Month Winners — Ventex",
  description: "Past monthly battle winners, vote counts, and outcomes on Ventex.",
};

export default function WinnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
