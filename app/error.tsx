"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { SITE_NAME } from "@/lib/brand";
import MagneticButton from "@/components/MagneticButton";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const brandName = SITE_NAME.toUpperCase();

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)] flex flex-col justify-between p-6 sm:p-12">
      <div className="flex items-center justify-between">
        <Link href="/" className="brand-lockup text-lg font-bold" aria-label={`${brandName} home`}>
          <span>{brandName}</span>
        </Link>
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--red)]">
          500 / APPLICATION ERROR
        </span>
      </div>

      <div className="max-w-xl my-auto py-12">
        <span className="status-dot mb-6 inline-block" />
        <h1 className="font-display text-5xl sm:text-7xl font-bold uppercase tracking-tighter leading-none mb-6">
          Something <br />
          <em className="text-[var(--red)] not-italic">stalled.</em>
        </h1>
        <p className="text-[var(--paper-dim)] text-base sm:text-lg max-w-md leading-relaxed mb-8">
          An unexpected issue interrupted your request. The error has been logged for review.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => reset()}
            className="magnetic-button magnetic-button--crimson cursor-pointer min-h-[44px]"
          >
            Try again <RotateCcw size={15} />
          </button>
          <MagneticButton href="/" variant="light">
            Go home <ArrowUpRight size={15} />
          </MagneticButton>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-[var(--smoke)] uppercase border-t border-line pt-6">
        <span>{brandName} / RECOVERY</span>
        <span>SYSTEM RESILIENT</span>
      </div>
    </div>
  );
}
