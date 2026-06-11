import React from 'react';

const testimonials = [
  {
    name: 'Arjun Mehta',
    role: 'Founder, Finlo AI',
    quote: 'Ventex gave us our first 3 investor meetings within a week of listing. The pitch score feature alone told us exactly where to improve.',
    raised: '₹40L raised',
    avatar: 'AM',
  },
  {
    name: 'Priya Nair',
    role: 'Founder, Stackr',
    quote: 'I was skeptical at first but the deal room feature is genuinely next-level. Our lead investor signed the term sheet through the platform.',
    raised: 'Seed round closed',
    avatar: 'PN',
  },
  {
    name: 'Rohit Verma',
    role: 'Founder, Loopkit',
    quote: 'Sold our first SaaS product through the Ventex marketplace in 48 hours. The Stripe integration is seamless and the commission is fair.',
    raised: '₹12L in product sales',
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
