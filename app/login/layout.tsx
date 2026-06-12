import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Login",
 description: "Log in to Ventex to manage pitches, marketplace purchases, investor tools, and founder workflows.",
 robots: {
 index: false,
 follow: true,
 },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
 return children;
}