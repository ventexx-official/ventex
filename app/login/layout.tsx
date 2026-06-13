import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to Ventexx to manage pitches, marketplace purchases, investor tools, and founder workflows.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}