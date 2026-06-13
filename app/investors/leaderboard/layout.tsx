import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Investor Leaderboard - Ventexx",
 description: "Ranked Ventexx investors by response rate, pitch reviews, and intros made.",
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
 return children;
}