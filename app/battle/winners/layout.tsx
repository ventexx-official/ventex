import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Pitch of the Month Winners - Folenzo",
 description: "Past monthly battle winners, vote counts, and outcomes on Folenzo.",
};

export default function WinnersLayout({ children }: { children: React.ReactNode }) {
 return children;
}