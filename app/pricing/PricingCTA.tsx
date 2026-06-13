"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PricingCTA() {
  const [href, setHref] = useState("/signup");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session?.user) setHref("/dashboard");
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 bg-[var(--text)] text-[var(--bg)] px-8 py-4 rounded-2xl font-black text-base hover:opacity-80 transition-opacity"
    >
      {href === "/dashboard" ? "Go to dashboard ->" : "Get started for free ->"}
    </Link>
  );
}
