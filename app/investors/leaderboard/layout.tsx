import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Leaderboard  -  Ventex",
  description: "Ranked Ventex investors by response rate, pitch reviews, and intros made.",
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}