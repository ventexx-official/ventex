"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

interface WelcomeCelebrationProps {
  role: "founder" | "investor" | "buyer" | "visitor";
  firstName?: string;
  destination: string;
}

const BRAND_COLORS = [
  "#d6453b", // red
  "#f1efe8", // paper
  "#c8c4ba", // paper-dim
  "#a8322f", // dark red
  "#e5534b", // light red
];

export function WelcomeCelebration({
  role,
  firstName,
  destination,
}: WelcomeCelebrationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check if ?welcome=1 is present
    const isWelcome = searchParams.get("welcome") === "1";
    if (isWelcome) {
      setShow(true);

      // Clean up URL so ?welcome=1 is removed from browser history and does not trigger again
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("welcome");
      window.history.replaceState({}, "", currentUrl.toString());
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, [searchParams]);

  if (!show) return null;

  const roleMessages: Record<string, string> = {
    founder: firstName
      ? `Welcome to the ecosystem, ${firstName}. Your founder journey starts now.`
      : "Welcome to the ecosystem. Your founder journey starts now.",
    investor: firstName
      ? `Welcome to the syndicate, ${firstName}. Start discovering early-stage ambition.`
      : "Welcome to the syndicate. Start discovering early-stage ambition.",
    buyer: firstName
      ? `Welcome to the marketplace, ${firstName}. Explore products built by founders.`
      : "Welcome to the marketplace. Explore products built by founders.",
    visitor: firstName
      ? `Welcome to Ventex, ${firstName}. Explore and discover what's next.`
      : "Welcome to Ventex. Explore and discover what's next.",
  };

  const message = roleMessages[role] || "Welcome to the ecosystem.";

  // Generate 24 deterministic confetti pieces
  const confettiPieces = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * 360;
    const distance = 80 + (i % 5) * 25;
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * distance;
    const y = Math.sin(rad) * distance;
    const color = BRAND_COLORS[i % BRAND_COLORS.length];
    const delay = (i % 6) * 0.05;
    const size = 6 + (i % 4) * 2;
    return { id: i, x, y, color, delay, size };
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome celebration"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-[460px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl text-center overflow-hidden">
        {/* CSS Confetti burst (disabled if prefers-reduced-motion) */}
        {!reducedMotion && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
            {confettiPieces.map((p) => (
              <span
                key={p.id}
                className="absolute rounded-sm opacity-0 animate-confetti-burst"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size * 0.6}px`,
                  backgroundColor: p.color,
                  animationDelay: `${p.delay}s`,
                  // @ts-ignore custom properties for animation
                  "--target-x": `${p.x}px`,
                  "--target-y": `${p.y}px`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--red)]/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-[var(--red)]" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
              {'//'} YOU'RE IN
            </span>
            <h2 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase">
              You're in.
            </h2>
          </div>

          <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed max-w-sm mx-auto">
            {message}
          </p>

          <button
            type="button"
            onClick={() => setShow(false)}
            className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg min-h-[44px]"
          >
            Enter Dashboard <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
