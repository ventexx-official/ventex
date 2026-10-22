"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { CursorAtmosphere } from "./CursorFollower";
import ScrollMotion from "./ScrollMotion";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // List of routes that should not display the Navbar and Footer
  const noNavRoutes = [
    "/onboarding",
    "/login",
    "/signup",
    "/forgot-password",
    "/auth/callback",
    "/admin",
    "/founder",
    "/investor",
    "/buyer",
    "/dashboard",
  ];
  const hideNav = noNavRoutes.some((route) => pathname.startsWith(route));

  // Sync Supabase session with a cookie so middleware can read it
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION"
      ) {
        if (session) {
          document.cookie = `sb-ventex-auth-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;
          // Also set legacy cookie if any middleware checks it
          document.cookie = `sb-ventex-auth-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;
        }
      } else if (event === "SIGNED_OUT") {
        document.cookie =
          "sb-ventex-auth-token=; path=/; max-age=0; SameSite=Lax; Secure";
        document.cookie =
          "sb-ventex-auth-token=; path=/; max-age=0; SameSite=Lax; Secure";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="site-shell flex flex-col min-h-screen">
      <div className="grain" aria-hidden="true" />
      <CursorAtmosphere />
      <ScrollMotion />
      {!hideNav && <Navbar />}
      <main className="flex-grow z-10 relative">{children}</main>
      {!hideNav && <Footer />}
    </div>
  );
}
