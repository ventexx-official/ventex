"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/brand";

const ROTATING_QUOTES = [
  "Every big thing started as a small idea.",
  "Build quietly. Go public when you're ready.",
  "Good ideas deserve to be found.",
];

interface AuthShellProps {
  children: React.ReactNode;
  stepKicker?: string;
}

export function AuthShell({ children, stepKicker = "AUTHENTICATION" }: AuthShellProps) {
  const brandName = SITE_NAME.toUpperCase();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // 6 second rotating quotes (pauses on hover, single line if reduced motion)
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ROTATING_QUOTES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion]);

  return (
    <div className="inner-page min-h-screen flex flex-col justify-between">
      {/* HEADER / BRAND BAR */}
      <header className="page-padding py-6 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark">
            <span>{brandName.charAt(0)}</span>
          </span>
          <span>{brandName}</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--smoke)]">
          {stepKicker} / 2026
        </span>
      </header>

      {/* MAIN CONTAINER: Split screen on desktop, centered form on mobile */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 py-8 lg:py-12 gap-8 lg:gap-16">
        
        {/* LEFT PANEL: Desktop only (hidden on mobile/touch screens) */}
        <div
          className="hidden lg:flex flex-1 flex-col justify-between self-stretch p-8 lg:p-12 relative overflow-hidden rounded-3xl bg-[var(--card)]/40 border border-[var(--line)]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle top index indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-[var(--smoke)]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
              {brandName} NETWORK
            </span>
            <span>REMOTE-FIRST</span>
          </div>

          {/* Central Hero Orbit Ring */}
          <div className="relative my-auto flex items-center justify-center py-16" aria-hidden="true">
            <div className="hero-orbit !static !transform-none !transition-none">
              <span>{brandName.charAt(0)}</span>
            </div>
          </div>

          {/* Rotating Quote with fade */}
          <div className="min-h-[90px] flex flex-col justify-end">
            <p
              key={quoteIndex}
              className="font-display text-2xl xl:text-3xl font-medium tracking-tight text-[var(--paper)] uppercase transition-opacity duration-700 ease-in-out"
            >
              “{ROTATING_QUOTES[prefersReducedMotion ? 0 : quoteIndex]}”
            </p>
            <div className="flex items-center gap-2 mt-4">
              {ROTATING_QUOTES.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === (prefersReducedMotion ? 0 : quoteIndex)
                      ? "w-8 bg-[var(--red)]"
                      : "w-2 bg-[var(--line)]"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Form Container */}
        <div className="w-full lg:max-w-[440px] flex items-center justify-center">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="page-padding py-6 flex items-center justify-between text-xs font-mono text-[var(--smoke)] border-t border-[var(--line)]">
        <span>© 2026 {brandName}</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-[var(--paper)] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[var(--paper)] transition-colors">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
