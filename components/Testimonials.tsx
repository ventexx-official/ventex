import React from 'react';

const testimonials = [
  {
    name: 'Arjun Mehta',
    role: 'Founder, Finlo AI',
    quote: 'Ventex centralized our entire data room securely and helped us close our pre-seed round 3x faster. The diligence features are unmatched.',
    raised: '₹40L pre-seed closed',
    avatar: 'AM',
  },
  {
    name: 'Priya Nair',
    role: 'Founder, Stackr',
    quote: 'We connected directly with Apex Capital via the verified network. The frictionless term sheet signing within the deal room saved us weeks of legal back-and-forth.',
    raised: '₹1.5Cr Seed secured',
    avatar: 'PN',
  },
  {
    name: 'Rohit Verma',
    role: 'Founder, Loopkit',
    quote: 'Generated ₹25L in pure MRR by licensing our enterprise API directly through the Ventex ecosystem marketplace. Zero friction, total liquidity.',
    raised: '₹25L product revenue',
    avatar: 'RV',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-[var(--bg)] py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">{'// '} founder stories</div>
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-.03em] text-[var(--text)] md:text-5xl">
          Founders trust Ventex.
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--text2)]">
          From first pitch to closed round — real results from the Ventex ecosystem.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card reveal flex flex-col gap-5 p-6"
            >
              {/* Quote */}
              <p className="flex-1 text-sm leading-7 text-[var(--text2)]">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="h-px bg-[var(--border)]" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold text-[var(--text)]"
                  style={{ borderColor: 'var(--border2)', background: 'var(--bg3)' }}
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-[var(--text)]">{t.name}</div>
                  <div className="truncate text-xs text-[var(--text3)]">{t.role}</div>
                </div>
                <span className="ml-auto shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-semibold text-emerald-500" style={{ borderColor: 'var(--border2)' }}>
                  {t.raised}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
