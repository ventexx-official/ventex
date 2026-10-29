"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE_NAME } from "@/lib/brand";
import MagneticButton from "@/components/MagneticButton";

export default function NotFound() {
  const brandName = SITE_NAME.toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)] flex flex-col justify-between p-6 sm:p-12">
      <div className="flex items-center justify-between">
        <Link href="/" className="brand-lockup text-lg font-bold" aria-label={`${brandName} home`}>
          <span>{brandName}</span>
        </Link>
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--smoke)]">
          404 / NOT FOUND
        </span>
      </div>

      <div className="max-w-xl my-auto py-12">
        <span className="status-dot mb-6 inline-block" />
        <h1 className="font-display text-5xl sm:text-7xl font-bold uppercase tracking-tighter leading-none mb-6">
          Lost in the <br />
          <em className="text-[var(--red)] not-italic">signal.</em>
        </h1>
        <p className="text-[var(--paper-dim)] text-base sm:text-lg max-w-md leading-relaxed mb-8">
          The page or pitch you are looking for has been moved, removed, or has not yet been published to the network.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <MagneticButton href="/" variant="crimson">
            Back to home <ArrowUpRight size={16} />
          </MagneticButton>
          <Link
            href="/discover"
            className="text-xs uppercase tracking-wider font-bold text-[var(--paper-dim)] hover:text-[var(--paper)] min-h-[44px] flex items-center px-4"
          >
            Explore pitches &rarr;
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-[var(--smoke)] uppercase border-t border-line pt-6">
        <span>{brandName} / 2026</span>
        <span>ERROR 404</span>
      </div>
    </div>
  );
}
